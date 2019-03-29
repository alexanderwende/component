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
                const directive = this._pendingValue;
                this._pendingValue = noChange;
                directive(this);
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
                const directive = this._pendingValue;
                this._pendingValue = noChange;
                directive(this);
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
                const directive = this._pendingValue;
                this._pendingValue = noChange;
                directive(this);
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
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.0.0');
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
    //# sourceMappingURL=attribute-converter.js.map

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
        constructor() {
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
    //# sourceMappingURL=component.js.map

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
        const declaration = Object.assign({}, DEFAULT_COMPONENT_DECLARATION, options);
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

    //# sourceMappingURL=index.js.map

    //# sourceMappingURL=index.js.map

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
        setActiveItem(item) {
            const index = this.items.indexOf(item);
            const entry = [
                index > -1 ? index : undefined,
                index > -1 ? item : undefined
            ];
            this.setEntryActive(entry);
        }
        setNextItemActive() {
            this.setEntryActive(this.getNextEntry());
        }
        setPreviousItemActive() {
            this.setEntryActive(this.getPreviousEntry());
        }
        setFirstItemActive() {
            this.setEntryActive(this.getFirstEntry());
        }
        setLastItemActive() {
            this.setEntryActive(this.getLastEntry());
        }
        handleKeydown(event) {
            const [prev, next] = (this.direction === 'horizontal') ? [ArrowLeft, ArrowRight] : [ArrowUp, ArrowDown];
            const prevIndex = this.activeIndex;
            let handled = false;
            switch (event.key) {
                case prev:
                    this.setPreviousItemActive();
                    handled = true;
                    break;
                case next:
                    this.setNextItemActive();
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
                this.setActiveItem(event.target);
                if (prevIndex !== this.activeIndex)
                    this.dispatchActiveItemChange(prevIndex);
            }
        }
        handleFocus(event) {
            if (this.itemType && event.target instanceof this.itemType) {
                const prevIndex = this.activeIndex;
                this.setActiveItem(event.target);
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
        setEntryActive(entry) {
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
        setEntryActive(entry) {
            super.setEntryActive(entry);
            if (this.activeItem)
                this.activeItem.focus();
        }
    }
    //# sourceMappingURL=list-key-manager.js.map

    const ARIABooleanConverter = {
        fromAttribute: (value) => value === 'true',
        toAttribute: (value) => (value == null) ? value : value.toString()
    };
    //# sourceMappingURL=aria-boolean-converter.js.map

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
            this.setHeader(this.querySelector('ui-accordion-header'));
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
            this.focusManager = new FocusKeyManager(this, this.querySelectorAll('ui-accordion-header'));
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
    //# sourceMappingURL=tab.js.map

    let TabList = class TabList extends Component {
        get tabs() {
            if (!this._tabs) {
                this._tabs = Array.from(this.querySelectorAll(Tab.selector));
            }
            return this._tabs;
        }
        connectedCallback() {
            super.connectedCallback();
            this.role = 'tablist';
        }
        updateCallback(changes, firstUpdate) {
            if (firstUpdate) {
                // const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement;
                // slot.addEventListener('slotchange', () => {
                //     console.log(`${slot.name} changed...`, slot.assignedNodes());
                // });
                // if the selector matches, the tab will already be selected, if not, the first tab
                // will be selected
                this.setSelectedTab(this.querySelector(`${Tab.selector}[aria-selected=true]`));
            }
        }
        setSelectedTab(tab) {
            // if no tab is provided, select the first, non-disabled tab
            if (!tab)
                tab = this.getNextTab();
            if (this.selectedTab && this.selectedTab !== tab) {
                this.deselectTab(this.selectedTab);
            }
            this.selectTab(tab);
            this.selectedTab = tab;
        }
        handleKeyDown(event) {
            switch (event.key) {
                case ArrowLeft:
                    this.setSelectedTab(this.getPreviousTab());
                    if (this.selectedTab)
                        this.selectedTab.focus();
                    break;
                case ArrowRight:
                    this.setSelectedTab(this.getNextTab());
                    if (this.selectedTab)
                        this.selectedTab.focus();
                    break;
                case ArrowDown:
                    if (this.selectedTab && this.selectedTab.panel)
                        this.selectedTab.panel.focus();
                    break;
            }
        }
        handleSelectedChange(event) {
            const tab = event.target;
            const selected = event.detail.current;
            if (selected) {
                this.setSelectedTab(tab);
            }
            else if (this.selectedTab === tab) {
                this.selectedTab = undefined;
            }
        }
        getPreviousTab() {
            const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : 0;
            let previousIndex = selectedIndex - 1;
            let previousTab = this.tabs[previousIndex];
            while (previousIndex > 0 && previousTab && previousTab.disabled) {
                previousTab = this.tabs[--previousIndex];
            }
            return (previousTab && !previousTab.disabled) ? previousTab : this.selectedTab;
        }
        getNextTab() {
            const selectedIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : -1;
            const lastIndex = this.tabs.length - 1;
            let nextIndex = selectedIndex + 1;
            let nextTab = this.tabs[nextIndex];
            while (nextIndex < lastIndex && nextTab && nextTab.disabled) {
                nextTab = this.tabs[++nextIndex];
            }
            return (nextTab && !nextTab.disabled) ? nextTab : this.selectedTab;
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
        listener({ event: 'selected-changed' }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [CustomEvent]),
        __metadata("design:returntype", void 0)
    ], TabList.prototype, "handleSelectedChange", null);
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
    //# sourceMappingURL=toggle.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGlyZWN0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3BhcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvdGVtcGxhdGUtcmVzdWx0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL2xpYi9wYXJ0cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saWIvZGVmYXVsdC10ZW1wbGF0ZS1wcm9jZXNzb3IuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3RlbXBsYXRlLWZhY3RvcnkuanMiLCIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvbGliL3JlbmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9saXQtaHRtbC5qcyIsIi4uL3NyYy9kZWNvcmF0b3JzL2F0dHJpYnV0ZS1jb252ZXJ0ZXIudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy91dGlscy9zdHJpbmctdXRpbHMudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9wcm9wZXJ0eS1kZWNsYXJhdGlvbi50cyIsIi4uL3NyYy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQtZGVjbGFyYXRpb24udHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9jb21wb25lbnQudHMiLCIuLi9zcmMvZGVjb3JhdG9ycy9saXN0ZW5lci50cyIsIi4uL3NyYy9kZWNvcmF0b3JzL3V0aWxzL2dldC1wcm9wZXJ0eS1kZXNjcmlwdG9yLnRzIiwiLi4vc3JjL2RlY29yYXRvcnMvcHJvcGVydHkudHMiLCIuLi9zcmMvY3NzLnRzIiwic3JjL2tleXMudHMiLCJzcmMvbGlzdC1rZXktbWFuYWdlci50cyIsInNyYy9hcmlhLWJvb2xlYW4tY29udmVydGVyLnRzIiwic3JjL2ljb24vaWNvbi50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLWhlYWRlci50cyIsInNyYy9oZWxwZXJzL2NvcHlyaWdodC50cyIsInNyYy9hY2NvcmRpb24vYWNjb3JkaW9uLXBhbmVsLnRzIiwic3JjL2FjY29yZGlvbi9hY2NvcmRpb24udHMiLCJzcmMvYXBwLnRlbXBsYXRlLnRzIiwic3JjL2NhcmQudHMiLCJzcmMvY2hlY2tib3gudHMiLCJzcmMvdGFicy90YWIudHMiLCJzcmMvdGFicy90YWItbGlzdC50cyIsInNyYy90YWJzL3RhYi1wYW5lbC50cyIsInNyYy90b2dnbGUudHMiLCJzcmMvYXBwLnN0eWxlcy50cyIsInNyYy9hcHAudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbmNvbnN0IGRpcmVjdGl2ZXMgPSBuZXcgV2Vha01hcCgpO1xuLyoqXG4gKiBCcmFuZHMgYSBmdW5jdGlvbiBhcyBhIGRpcmVjdGl2ZSBzbyB0aGF0IGxpdC1odG1sIHdpbGwgY2FsbCB0aGUgZnVuY3Rpb25cbiAqIGR1cmluZyB0ZW1wbGF0ZSByZW5kZXJpbmcsIHJhdGhlciB0aGFuIHBhc3NpbmcgYXMgYSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gZiBUaGUgZGlyZWN0aXZlIGZhY3RvcnkgZnVuY3Rpb24uIE11c3QgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYVxuICogZnVuY3Rpb24gb2YgdGhlIHNpZ25hdHVyZSBgKHBhcnQ6IFBhcnQpID0+IHZvaWRgLiBUaGUgcmV0dXJuZWQgZnVuY3Rpb24gd2lsbFxuICogYmUgY2FsbGVkIHdpdGggdGhlIHBhcnQgb2JqZWN0XG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7ZGlyZWN0aXZlLCBodG1sfSBmcm9tICdsaXQtaHRtbCc7XG4gKlxuICogY29uc3QgaW1tdXRhYmxlID0gZGlyZWN0aXZlKCh2KSA9PiAocGFydCkgPT4ge1xuICogICBpZiAocGFydC52YWx1ZSAhPT0gdikge1xuICogICAgIHBhcnQuc2V0VmFsdWUodilcbiAqICAgfVxuICogfSk7XG4gKiBgYGBcbiAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9IChmKSA9PiAoKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBkID0gZiguLi5hcmdzKTtcbiAgICBkaXJlY3RpdmVzLnNldChkLCB0cnVlKTtcbiAgICByZXR1cm4gZDtcbn0pO1xuZXhwb3J0IGNvbnN0IGlzRGlyZWN0aXZlID0gKG8pID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIG8gPT09ICdmdW5jdGlvbicgJiYgZGlyZWN0aXZlcy5oYXMobyk7XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0aXZlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogVHJ1ZSBpZiB0aGUgY3VzdG9tIGVsZW1lbnRzIHBvbHlmaWxsIGlzIGluIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ0VQb2x5ZmlsbCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLnBvbHlmaWxsV3JhcEZsdXNoQ2FsbGJhY2sgIT09XG4gICAgICAgIHVuZGVmaW5lZDtcbi8qKlxuICogUmVwYXJlbnRzIG5vZGVzLCBzdGFydGluZyBmcm9tIGBzdGFydE5vZGVgIChpbmNsdXNpdmUpIHRvIGBlbmROb2RlYFxuICogKGV4Y2x1c2l2ZSksIGludG8gYW5vdGhlciBjb250YWluZXIgKGNvdWxkIGJlIHRoZSBzYW1lIGNvbnRhaW5lciksIGJlZm9yZVxuICogYGJlZm9yZU5vZGVgLiBJZiBgYmVmb3JlTm9kZWAgaXMgbnVsbCwgaXQgYXBwZW5kcyB0aGUgbm9kZXMgdG8gdGhlXG4gKiBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCByZXBhcmVudE5vZGVzID0gKGNvbnRhaW5lciwgc3RhcnQsIGVuZCA9IG51bGwsIGJlZm9yZSA9IG51bGwpID0+IHtcbiAgICBsZXQgbm9kZSA9IHN0YXJ0O1xuICAgIHdoaWxlIChub2RlICE9PSBlbmQpIHtcbiAgICAgICAgY29uc3QgbiA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobm9kZSwgYmVmb3JlKTtcbiAgICAgICAgbm9kZSA9IG47XG4gICAgfVxufTtcbi8qKlxuICogUmVtb3ZlcyBub2Rlcywgc3RhcnRpbmcgZnJvbSBgc3RhcnROb2RlYCAoaW5jbHVzaXZlKSB0byBgZW5kTm9kZWBcbiAqIChleGNsdXNpdmUpLCBmcm9tIGBjb250YWluZXJgLlxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlTm9kZXMgPSAoY29udGFpbmVyLCBzdGFydE5vZGUsIGVuZE5vZGUgPSBudWxsKSA9PiB7XG4gICAgbGV0IG5vZGUgPSBzdGFydE5vZGU7XG4gICAgd2hpbGUgKG5vZGUgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgbiA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgbm9kZSA9IG47XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSB7fTtcbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBOb2RlUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBBbiBleHByZXNzaW9uIG1hcmtlciB3aXRoIGVtYmVkZGVkIHVuaXF1ZSBrZXkgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGhcbiAqIHBvc3NpYmxlIHRleHQgaW4gdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY29uc3QgbWFya2VyID0gYHt7bGl0LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnNsaWNlKDIpfX19YDtcbi8qKlxuICogQW4gZXhwcmVzc2lvbiBtYXJrZXIgdXNlZCB0ZXh0LXBvc2l0aW9ucywgbXVsdGktYmluZGluZyBhdHRyaWJ1dGVzLCBhbmRcbiAqIGF0dHJpYnV0ZXMgd2l0aCBtYXJrdXAtbGlrZSB0ZXh0IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vZGVNYXJrZXIgPSBgPCEtLSR7bWFya2VyfS0tPmA7XG5leHBvcnQgY29uc3QgbWFya2VyUmVnZXggPSBuZXcgUmVnRXhwKGAke21hcmtlcn18JHtub2RlTWFya2VyfWApO1xuLyoqXG4gKiBTdWZmaXggYXBwZW5kZWQgdG8gYWxsIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBUZW1wbGF0ZSB0aGF0IHRyYWNrcyB0aGUgbG9jYXRpb24gb2YgZHluYW1pYyBwYXJ0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHQsIGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbXTtcbiAgICAgICAgY29uc3QgX3ByZXBhcmVUZW1wbGF0ZSA9ICh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgICAgICAgICAvLyBFZGdlIG5lZWRzIGFsbCA0IHBhcmFtZXRlcnMgcHJlc2VudDsgSUUxMSBuZWVkcyAzcmQgcGFyYW1ldGVyIHRvIGJlXG4gICAgICAgICAgICAvLyBudWxsXG4gICAgICAgICAgICBjb25zdCB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGNvbnRlbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGxhc3QgaW5kZXggYXNzb2NpYXRlZCB3aXRoIGEgcGFydC4gV2UgdHJ5IHRvIGRlbGV0ZVxuICAgICAgICAgICAgLy8gdW5uZWNlc3Nhcnkgbm9kZXMsIGJ1dCB3ZSBuZXZlciB3YW50IHRvIGFzc29jaWF0ZSB0d28gZGlmZmVyZW50IHBhcnRzXG4gICAgICAgICAgICAvLyB0byB0aGUgc2FtZSBpbmRleC4gVGhleSBtdXN0IGhhdmUgYSBjb25zdGFudCBub2RlIGJldHdlZW4uXG4gICAgICAgICAgICBsZXQgbGFzdFBhcnRJbmRleCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAod2Fsa2VyLm5leHROb2RlKCkpIHtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB3YWxrZXIuY3VycmVudE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgLyogTm9kZS5FTEVNRU5UX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTmFtZWROb2RlTWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXR0cmlidXRlcyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgcmV0dXJuZWQgaW4gZG9jdW1lbnQgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBwYXJ0aWN1bGFyLCBFZGdlL0lFIGNhbiByZXR1cm4gdGhlbSBvdXQgb2Ygb3JkZXIsIHNvIHdlIGNhbm5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzdW1lIGEgY29ycmVzcG9uZGFuY2UgYmV0d2VlbiBwYXJ0IGluZGV4IGFuZCBhdHRyaWJ1dGUgaW5kZXguXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbaV0udmFsdWUuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY291bnQtLSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHRlbXBsYXRlIGxpdGVyYWwgc2VjdGlvbiBsZWFkaW5nIHVwIHRvIHRoZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4cHJlc3Npb24gaW4gdGhpcyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdGb3JQYXJ0ID0gcmVzdWx0LnN0cmluZ3NbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMoc3RyaW5nRm9yUGFydClbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbGwgYm91bmQgYXR0cmlidXRlcyBoYXZlIGhhZCBhIHN1ZmZpeCBhZGRlZCBpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlbXBsYXRlUmVzdWx0I2dldEhUTUwgdG8gb3B0IG91dCBvZiBzcGVjaWFsIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsaW5nLiBUbyBsb29rIHVwIHRoZSBhdHRyaWJ1dGUgdmFsdWUgd2UgYWxzbyBuZWVkIHRvIGFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdWZmaXguXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlTG9va3VwTmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKSArIGJvdW5kQXR0cmlidXRlU3VmZml4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IGF0dHJpYnV0ZVZhbHVlLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnYXR0cmlidXRlJywgaW5kZXgsIG5hbWUsIHN0cmluZ3MgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTG9va3VwTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4ICs9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcHJlcGFyZVRlbXBsYXRlKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDMgLyogTm9kZS5URVhUX05PREUgKi8pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5vZGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuaW5kZXhPZihtYXJrZXIpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSBkYXRhLnNwbGl0KG1hcmtlclJlZ2V4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKChzdHJpbmdzW2ldID09PSAnJykgPyBjcmVhdGVNYXJrZXIoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cmluZ3NbaV0pLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goeyB0eXBlOiAnbm9kZScsIGluZGV4OiArK2luZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyB0ZXh0LCB3ZSBtdXN0IGluc2VydCBhIGNvbW1lbnQgdG8gbWFyayBvdXIgcGxhY2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gdHJ1c3QgaXQgd2lsbCBzdGljayBhcm91bmQgYWZ0ZXIgY2xvbmluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzW2xhc3RJbmRleF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1JlbW92ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5kYXRhID0gc3RyaW5nc1tsYXN0SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHBhcnQgZm9yIGVhY2ggbWF0Y2ggZm91bmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCArPSBsYXN0SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBOb2RlLkNPTU1FTlRfTk9ERSAqLykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5kYXRhID09PSBtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBhIG5ldyBtYXJrZXIgbm9kZSB0byBiZSB0aGUgc3RhcnROb2RlIG9mIHRoZSBQYXJ0IGlmIGFueSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBhcmUgdHJ1ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAqIFdlIGRvbid0IGhhdmUgYSBwcmV2aW91c1NpYmxpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAqIFRoZSBwcmV2aW91c1NpYmxpbmcgaXMgYWxyZWFkeSB0aGUgc3RhcnQgb2YgYSBwcmV2aW91cyBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcmV2aW91c1NpYmxpbmcgPT09IG51bGwgfHwgaW5kZXggPT09IGxhc3RQYXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKHsgdHlwZTogJ25vZGUnLCBpbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSBuZXh0U2libGluZywga2VlcCB0aGlzIG5vZGUgc28gd2UgaGF2ZSBhbiBlbmQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbHNlLCB3ZSBjYW4gcmVtb3ZlIGl0IHRvIHNhdmUgZnV0dXJlIGNvc3RzLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRhdGEgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzVG9SZW1vdmUucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChpID0gbm9kZS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBjb25zaWRlciB3aGV0aGVyIGl0J3MgZXZlbiB3b3J0aCBpdCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgYmluZGluZ3MgaW4gY29tbWVudHMgd29ya1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCh7IHR5cGU6ICdub2RlJywgaW5kZXg6IC0xIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfcHJlcGFyZVRlbXBsYXRlKGVsZW1lbnQpO1xuICAgICAgICAvLyBSZW1vdmUgdGV4dCBiaW5kaW5nIG5vZGVzIGFmdGVyIHRoZSB3YWxrIHRvIG5vdCBkaXN0dXJiIHRoZSBUcmVlV2Fsa2VyXG4gICAgICAgIGZvciAoY29uc3QgbiBvZiBub2Rlc1RvUmVtb3ZlKSB7XG4gICAgICAgICAgICBuLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobik7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY29uc3QgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgPSAocGFydCkgPT4gcGFydC5pbmRleCAhPT0gLTE7XG4vLyBBbGxvd3MgYGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpYCB0byBiZSByZW5hbWVkIGZvciBhXG4vLyBzbWFsbCBtYW51YWwgc2l6ZS1zYXZpbmdzLlxuZXhwb3J0IGNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuLyoqXG4gKiBUaGlzIHJlZ2V4IGV4dHJhY3RzIHRoZSBhdHRyaWJ1dGUgbmFtZSBwcmVjZWRpbmcgYW4gYXR0cmlidXRlLXBvc2l0aW9uXG4gKiBleHByZXNzaW9uLiBJdCBkb2VzIHRoaXMgYnkgbWF0Y2hpbmcgdGhlIHN5bnRheCBhbGxvd2VkIGZvciBhdHRyaWJ1dGVzXG4gKiBhZ2FpbnN0IHRoZSBzdHJpbmcgbGl0ZXJhbCBkaXJlY3RseSBwcmVjZWRpbmcgdGhlIGV4cHJlc3Npb24sIGFzc3VtaW5nIHRoYXRcbiAqIHRoZSBleHByZXNzaW9uIGlzIGluIGFuIGF0dHJpYnV0ZS12YWx1ZSBwb3NpdGlvbi5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2F0dHJpYnV0ZXMtMFxuICpcbiAqIFwiXFwwLVxceDFGXFx4N0YtXFx4OUZcIiBhcmUgVW5pY29kZSBjb250cm9sIGNoYXJhY3RlcnNcbiAqXG4gKiBcIiBcXHgwOVxceDBhXFx4MGNcXHgwZFwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNzcGFjZS1jaGFyYWN0ZXJcbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSBjb250cm9sIGNoYXJhY3Rlciwgc3BhY2UgY2hhcmFjdGVyLCAoJyksXG4gKiAgICAoXCIpLCBcIj5cIiwgXCI9XCIsIG9yIFwiL1wiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5leHBvcnQgY29uc3QgbGFzdEF0dHJpYnV0ZU5hbWVSZWdleCA9IC8oWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0pKFteXFwwLVxceDFGXFx4N0YtXFx4OUYgXFx4MDlcXHgwYVxceDBjXFx4MGRcIic+PS9dKykoWyBcXHgwOVxceDBhXFx4MGNcXHgwZF0qPVsgXFx4MDlcXHgwYVxceDBjXFx4MGRdKig/OlteIFxceDA5XFx4MGFcXHgwY1xceDBkXCInYDw+PV0qfFwiW15cIl0qfCdbXiddKikpJC87XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG4vKipcbiAqIEBtb2R1bGUgbGl0LWh0bWxcbiAqL1xuaW1wb3J0IHsgaXNDRVBvbHlmaWxsIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgaXNUZW1wbGF0ZVBhcnRBY3RpdmUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgYSBgVGVtcGxhdGVgIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIHRoZSBET00gYW5kIHVwZGF0ZWRcbiAqIHdpdGggbmV3IHZhbHVlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlSW5zdGFuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBwcm9jZXNzb3IsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLnByb2Nlc3NvciA9IHByb2Nlc3NvcjtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgdXBkYXRlKHZhbHVlcykge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl9wYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBhcnQuc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fcGFydHMpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0LmNvbW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9uZSgpIHtcbiAgICAgICAgLy8gV2hlbiB1c2luZyB0aGUgQ3VzdG9tIEVsZW1lbnRzIHBvbHlmaWxsLCBjbG9uZSB0aGUgbm9kZSwgcmF0aGVyIHRoYW5cbiAgICAgICAgLy8gaW1wb3J0aW5nIGl0LCB0byBrZWVwIHRoZSBmcmFnbWVudCBpbiB0aGUgdGVtcGxhdGUncyBkb2N1bWVudC4gVGhpc1xuICAgICAgICAvLyBsZWF2ZXMgdGhlIGZyYWdtZW50IGluZXJ0IHNvIGN1c3RvbSBlbGVtZW50cyB3b24ndCB1cGdyYWRlIGFuZFxuICAgICAgICAvLyBwb3RlbnRpYWxseSBtb2RpZnkgdGhlaXIgY29udGVudHMgYnkgY3JlYXRpbmcgYSBwb2x5ZmlsbGVkIFNoYWRvd1Jvb3RcbiAgICAgICAgLy8gd2hpbGUgd2UgdHJhdmVyc2UgdGhlIHRyZWUuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gaXNDRVBvbHlmaWxsID9cbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LmNsb25lTm9kZSh0cnVlKSA6XG4gICAgICAgICAgICBkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGUuZWxlbWVudC5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnRlbXBsYXRlLnBhcnRzO1xuICAgICAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICAgICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgICAgIGNvbnN0IF9wcmVwYXJlSW5zdGFuY2UgPSAoZnJhZ21lbnQpID0+IHtcbiAgICAgICAgICAgIC8vIEVkZ2UgbmVlZHMgYWxsIDQgcGFyYW1ldGVycyBwcmVzZW50OyBJRTExIG5lZWRzIDNyZCBwYXJhbWV0ZXIgdG8gYmVcbiAgICAgICAgICAgIC8vIG51bGxcbiAgICAgICAgICAgIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoZnJhZ21lbnQsIDEzMyAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVHxURVhUfSAqLywgbnVsbCwgZmFsc2UpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgdGhlIG5vZGVzIGFuZCBwYXJ0cyBvZiBhIHRlbXBsYXRlXG4gICAgICAgICAgICB3aGlsZSAocGFydEluZGV4IDwgcGFydHMubGVuZ3RoICYmIG5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gcGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyBDb25zZWN1dGl2ZSBQYXJ0cyBtYXkgaGF2ZSB0aGUgc2FtZSBub2RlIGluZGV4LCBpbiB0aGUgY2FzZSBvZlxuICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIGJvdW5kIGF0dHJpYnV0ZXMgb24gYW4gZWxlbWVudC4gU28gZWFjaCBpdGVyYXRpb24gd2UgZWl0aGVyXG4gICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50IHRoZSBub2RlSW5kZXgsIGlmIHdlIGFyZW4ndCBvbiBhIG5vZGUgd2l0aCBhIHBhcnQsIG9yIHRoZVxuICAgICAgICAgICAgICAgIC8vIHBhcnRJbmRleCBpZiB3ZSBhcmUuIEJ5IG5vdCBpbmNyZW1lbnRpbmcgdGhlIG5vZGVJbmRleCB3aGVuIHdlIGZpbmQgYVxuICAgICAgICAgICAgICAgIC8vIHBhcnQsIHdlIGFsbG93IGZvciB0aGUgbmV4dCBwYXJ0IHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIG5vZGUgaWYgbmVjY2Vzc2FzcnkuXG4gICAgICAgICAgICAgICAgaWYgKCFpc1RlbXBsYXRlUGFydEFjdGl2ZShwYXJ0KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlSW5kZXggPT09IHBhcnQuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wcm9jZXNzb3IuaGFuZGxlVGV4dEV4cHJlc3Npb24odGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuaW5zZXJ0QWZ0ZXJOb2RlKG5vZGUucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0cy5wdXNoKC4uLnRoaXMucHJvY2Vzc29yLmhhbmRsZUF0dHJpYnV0ZUV4cHJlc3Npb25zKG5vZGUsIHBhcnQubmFtZSwgcGFydC5zdHJpbmdzLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3ByZXBhcmVJbnN0YW5jZShub2RlLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIF9wcmVwYXJlSW5zdGFuY2UoZnJhZ21lbnQpO1xuICAgICAgICBpZiAoaXNDRVBvbHlmaWxsKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZG9wdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgICAgICAgY3VzdG9tRWxlbWVudHMudXBncmFkZShmcmFnbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlLWluc3RhbmNlLmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZXBhcmVudE5vZGVzIH0gZnJvbSAnLi9kb20uanMnO1xuaW1wb3J0IHsgYm91bmRBdHRyaWJ1dGVTdWZmaXgsIGxhc3RBdHRyaWJ1dGVOYW1lUmVnZXgsIG1hcmtlciwgbm9kZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgYGh0bWxgLCB3aGljaCBob2xkcyBhIFRlbXBsYXRlIGFuZCB0aGUgdmFsdWVzIGZyb21cbiAqIGludGVycG9sYXRlZCBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdzLCB2YWx1ZXMsIHR5cGUsIHByb2Nlc3Nvcikge1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgSFRNTCB1c2VkIHRvIGNyZWF0ZSBhIGA8dGVtcGxhdGU+YCBlbGVtZW50LlxuICAgICAqL1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIGNvbnN0IGVuZEluZGV4ID0gdGhpcy5zdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5kSW5kZXg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMuc3RyaW5nc1tpXTtcbiAgICAgICAgICAgIC8vIFRoaXMgZXhlYygpIGNhbGwgZG9lcyB0d28gdGhpbmdzOlxuICAgICAgICAgICAgLy8gMSkgQXBwZW5kcyBhIHN1ZmZpeCB0byB0aGUgYm91bmQgYXR0cmlidXRlIG5hbWUgdG8gb3B0IG91dCBvZiBzcGVjaWFsXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGUgdmFsdWUgcGFyc2luZyB0aGF0IElFMTEgYW5kIEVkZ2UgZG8sIGxpa2UgZm9yIHN0eWxlIGFuZFxuICAgICAgICAgICAgLy8gbWFueSBTVkcgYXR0cmlidXRlcy4gVGhlIFRlbXBsYXRlIGNsYXNzIGFsc28gYXBwZW5kcyB0aGUgc2FtZSBzdWZmaXhcbiAgICAgICAgICAgIC8vIHdoZW4gbG9va2luZyB1cCBhdHRyaWJ1dGVzIHRvIGNyZWF0ZSBQYXJ0cy5cbiAgICAgICAgICAgIC8vIDIpIEFkZHMgYW4gdW5xdW90ZWQtYXR0cmlidXRlLXNhZmUgbWFya2VyIGZvciB0aGUgZmlyc3QgZXhwcmVzc2lvbiBpblxuICAgICAgICAgICAgLy8gYW4gYXR0cmlidXRlLiBTdWJzZXF1ZW50IGF0dHJpYnV0ZSBleHByZXNzaW9ucyB3aWxsIHVzZSBub2RlIG1hcmtlcnMsXG4gICAgICAgICAgICAvLyBhbmQgdGhpcyBpcyBzYWZlIHNpbmNlIGF0dHJpYnV0ZXMgd2l0aCBtdWx0aXBsZSBleHByZXNzaW9ucyBhcmVcbiAgICAgICAgICAgIC8vIGd1YXJhbnRlZWQgdG8gYmUgcXVvdGVkLlxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsYXN0QXR0cmlidXRlTmFtZVJlZ2V4LmV4ZWMocyk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBzdGFydGluZyBhIG5ldyBib3VuZCBhdHRyaWJ1dGUuXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBzYWZlIGF0dHJpYnV0ZSBzdWZmaXgsIGFuZCB1c2UgdW5xdW90ZWQtYXR0cmlidXRlLXNhZmVcbiAgICAgICAgICAgICAgICAvLyBtYXJrZXIuXG4gICAgICAgICAgICAgICAgaHRtbCArPSBzLnN1YnN0cigwLCBtYXRjaC5pbmRleCkgKyBtYXRjaFsxXSArIG1hdGNoWzJdICtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRBdHRyaWJ1dGVTdWZmaXggKyBtYXRjaFszXSArIG1hcmtlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGVpdGhlciBpbiBhIGJvdW5kIG5vZGUsIG9yIHRyYWlsaW5nIGJvdW5kIGF0dHJpYnV0ZS5cbiAgICAgICAgICAgICAgICAvLyBFaXRoZXIgd2F5LCBub2RlTWFya2VyIGlzIHNhZmUgdG8gdXNlLlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gcyArIG5vZGVNYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGh0bWwgKyB0aGlzLnN0cmluZ3NbZW5kSW5kZXhdO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGhpcy5nZXRIVE1MKCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgZm9yIFNWRyBmcmFnbWVudHMuXG4gKlxuICogVGhpcyBjbGFzcyB3cmFwcyBIVE1sIGluIGFuIGA8c3ZnPmAgdGFnIGluIG9yZGVyIHRvIHBhcnNlIGl0cyBjb250ZW50cyBpbiB0aGVcbiAqIFNWRyBuYW1lc3BhY2UsIHRoZW4gbW9kaWZpZXMgdGhlIHRlbXBsYXRlIHRvIHJlbW92ZSB0aGUgYDxzdmc+YCB0YWcgc28gdGhhdFxuICogY2xvbmVzIG9ubHkgY29udGFpbmVyIHRoZSBvcmlnaW5hbCBmcmFnbWVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNWR1RlbXBsYXRlUmVzdWx0IGV4dGVuZHMgVGVtcGxhdGVSZXN1bHQge1xuICAgIGdldEhUTUwoKSB7XG4gICAgICAgIHJldHVybiBgPHN2Zz4ke3N1cGVyLmdldEhUTUwoKX08L3N2Zz5gO1xuICAgIH1cbiAgICBnZXRUZW1wbGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gc3VwZXIuZ2V0VGVtcGxhdGVFbGVtZW50KCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICBjb25zdCBzdmdFbGVtZW50ID0gY29udGVudC5maXJzdENoaWxkO1xuICAgICAgICBjb250ZW50LnJlbW92ZUNoaWxkKHN2Z0VsZW1lbnQpO1xuICAgICAgICByZXBhcmVudE5vZGVzKGNvbnRlbnQsIHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1yZXN1bHQuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKiBAbW9kdWxlIGxpdC1odG1sXG4gKi9cbmltcG9ydCB7IGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHsgcmVtb3ZlTm9kZXMgfSBmcm9tICcuL2RvbS5qcyc7XG5pbXBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vcGFydC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZUluc3RhbmNlIH0gZnJvbSAnLi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCB9IGZyb20gJy4vdGVtcGxhdGUtcmVzdWx0LmpzJztcbmltcG9ydCB7IGNyZWF0ZU1hcmtlciB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fFxuICAgICAgICAhKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSk7XG59O1xuLyoqXG4gKiBTZXRzIGF0dHJpYnV0ZSB2YWx1ZXMgZm9yIEF0dHJpYnV0ZVBhcnRzLCBzbyB0aGF0IHRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlXG4gKiBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLlxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlQ29tbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKSB7XG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucGFydHNbaV0gPSB0aGlzLl9jcmVhdGVQYXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNpbmdsZSBwYXJ0LiBPdmVycmlkZSB0aGlzIHRvIGNyZWF0ZSBhIGRpZmZlcm50IHR5cGUgb2YgcGFydC5cbiAgICAgKi9cbiAgICBfY3JlYXRlUGFydCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBdHRyaWJ1dGVQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG4gICAgICAgIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IHN0cmluZ3NbaV07XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gcGFydC52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodiAhPSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIChBcnJheS5pc0FycmF5KHYpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdiAhPT0gJ3N0cmluZycgJiYgdltTeW1ib2wuaXRlcmF0b3JdKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHQgb2Ygdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCArPSB0eXBlb2YgdCA9PT0gJ3N0cmluZycgPyB0IDogU3RyaW5nKHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYgOiBTdHJpbmcodik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRleHQgKz0gc3RyaW5nc1tsXTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGNvbW1pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodGhpcy5uYW1lLCB0aGlzLl9nZXRWYWx1ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgICBjb25zdHJ1Y3Rvcihjb21pdHRlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNvbW1pdHRlciA9IGNvbWl0dGVyO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT09IG5vQ2hhbmdlICYmICghaXNQcmltaXRpdmUodmFsdWUpIHx8IHZhbHVlICE9PSB0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGEgbm90IGEgZGlyZWN0aXZlLCBkaXJ0eSB0aGUgY29tbWl0dGVyIHNvIHRoYXQgaXQnbGxcbiAgICAgICAgICAgIC8vIGNhbGwgc2V0QXR0cmlidXRlLiBJZiB0aGUgdmFsdWUgaXMgYSBkaXJlY3RpdmUsIGl0J2xsIGRpcnR5IHRoZVxuICAgICAgICAgICAgLy8gY29tbWl0dGVyIGlmIGl0IGNhbGxzIHNldFZhbHVlKCkuXG4gICAgICAgICAgICBpZiAoIWlzRGlyZWN0aXZlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tbWl0dGVyLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLnZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbW1pdHRlci5jb21taXQoKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTm9kZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBpbnRvIGEgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgYXBwZW5kSW50byhjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5zdGFydE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICB0aGlzLmVuZE5vZGUgPSBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlTWFya2VyKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoaXMgcGFydCBiZXR3ZWVuIGByZWZgIGFuZCBgcmVmYCdzIG5leHQgc2libGluZy4gQm90aCBgcmVmYCBhbmRcbiAgICAgKiBpdHMgbmV4dCBzaWJsaW5nIG11c3QgYmUgc3RhdGljLCB1bmNoYW5naW5nIG5vZGVzIHN1Y2ggYXMgdGhvc2UgdGhhdCBhcHBlYXJcbiAgICAgKiBpbiBhIGxpdGVyYWwgc2VjdGlvbiBvZiBhIHRlbXBsYXRlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXJ0IG11c3QgYmUgZW1wdHksIGFzIGl0cyBjb250ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgbW92ZWQuXG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXJOb2RlKHJlZikge1xuICAgICAgICB0aGlzLnN0YXJ0Tm9kZSA9IHJlZjtcbiAgICAgICAgdGhpcy5lbmROb2RlID0gcmVmLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIHRoaXMgcGFydCBpbnRvIGEgcGFyZW50IHBhcnQuXG4gICAgICpcbiAgICAgKiBUaGlzIHBhcnQgbXVzdCBiZSBlbXB0eSwgYXMgaXRzIGNvbnRlbnRzIGFyZSBub3QgYXV0b21hdGljYWxseSBtb3ZlZC5cbiAgICAgKi9cbiAgICBhcHBlbmRJbnRvUGFydChwYXJ0KSB7XG4gICAgICAgIHBhcnQuX2luc2VydCh0aGlzLnN0YXJ0Tm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgcGFydC5faW5zZXJ0KHRoaXMuZW5kTm9kZSA9IGNyZWF0ZU1hcmtlcigpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXBwZW5kcyB0aGlzIHBhcnQgYWZ0ZXIgYHJlZmBcbiAgICAgKlxuICAgICAqIFRoaXMgcGFydCBtdXN0IGJlIGVtcHR5LCBhcyBpdHMgY29udGVudHMgYXJlIG5vdCBhdXRvbWF0aWNhbGx5IG1vdmVkLlxuICAgICAqL1xuICAgIGluc2VydEFmdGVyUGFydChyZWYpIHtcbiAgICAgICAgcmVmLl9pbnNlcnQodGhpcy5zdGFydE5vZGUgPSBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgIHRoaXMuZW5kTm9kZSA9IHJlZi5lbmROb2RlO1xuICAgICAgICByZWYuZW5kTm9kZSA9IHRoaXMuc3RhcnROb2RlO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb21taXROb2RlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgICAgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgICAgICAgICAgdGhpcy5fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gbm90aGluZztcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICAgICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfaW5zZXJ0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5lbmROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHRoaXMuZW5kTm9kZSk7XG4gICAgfVxuICAgIF9jb21taXROb2RlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5faW5zZXJ0KHZhbHVlKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfY29tbWl0VGV4dCh2YWx1ZSkge1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zdGFydE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLmVuZE5vZGUucHJldmlvdXNTaWJsaW5nICYmXG4gICAgICAgICAgICBub2RlLm5vZGVUeXBlID09PSAzIC8qIE5vZGUuVEVYVF9OT0RFICovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBvbmx5IGhhdmUgYSBzaW5nbGUgdGV4dCBub2RlIGJldHdlZW4gdGhlIG1hcmtlcnMsIHdlIGNhbiBqdXN0XG4gICAgICAgICAgICAvLyBzZXQgaXRzIHZhbHVlLCByYXRoZXIgdGhhbiByZXBsYWNpbmcgaXQuXG4gICAgICAgICAgICAvLyBUT0RPKGp1c3RpbmZhZ25hbmkpOiBDYW4gd2UganVzdCBjaGVjayBpZiB0aGlzLnZhbHVlIGlzIHByaW1pdGl2ZT9cbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29tbWl0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBfY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB0aGlzLm9wdGlvbnMudGVtcGxhdGVGYWN0b3J5KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBUZW1wbGF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICB0aGlzLnZhbHVlLnRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZS51cGRhdGUodmFsdWUudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBwcm9wYWdhdGUgdGhlIHRlbXBsYXRlIHByb2Nlc3NvciBmcm9tIHRoZSBUZW1wbGF0ZVJlc3VsdFxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSB1c2UgaXRzIHN5bnRheCBleHRlbnNpb24sIGV0Yy4gVGhlIHRlbXBsYXRlIGZhY3RvcnkgY29tZXNcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIHJlbmRlciBmdW5jdGlvbiBvcHRpb25zIHNvIHRoYXQgaXQgY2FuIGNvbnRyb2wgdGVtcGxhdGVcbiAgICAgICAgICAgIC8vIGNhY2hpbmcgYW5kIHByZXByb2Nlc3NpbmcuXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlLCB2YWx1ZS5wcm9jZXNzb3IsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSgpO1xuICAgICAgICAgICAgaW5zdGFuY2UudXBkYXRlKHZhbHVlLnZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfY29tbWl0SXRlcmFibGUodmFsdWUpIHtcbiAgICAgICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAgICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgICAgIC8vIGFuIEl0ZXJhYmxlLCBidXQgaXQgbGV0cyB1cyByZWN1cnNlIGVhc2lseSBhbmQgZWZmaWNpZW50bHkgdXBkYXRlIEFycmF5c1xuICAgICAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAgICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cbiAgICAgICAgLy8gSWYgX3ZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgICAgIC8vIGl0ZXJhYmxlIGFuZCBfdmFsdWUgd2lsbCBjb250YWluIHRoZSBOb2RlUGFydHMgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAgICAgLy8gcmVuZGVyLiBJZiBfdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAgICAgLy8gYXJyYXkgZm9yIE5vZGVQYXJ0cy5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XG4gICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTGV0cyB1cyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHN0YW1wZWQgc28gd2UgY2FuIGNsZWFyIGxlZnRvdmVyXG4gICAgICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICAgICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy52YWx1ZTtcbiAgICAgICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgICAgIGxldCBpdGVtUGFydDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gcmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgICAgIGlmIChpdGVtUGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlbVBhcnQgPSBuZXcgTm9kZVBhcnQodGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpdGVtUGFydHMucHVzaChpdGVtUGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtUGFydC5hcHBlbmRJbnRvUGFydCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1QYXJ0Lmluc2VydEFmdGVyUGFydChpdGVtUGFydHNbcGFydEluZGV4IC0gMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1QYXJ0LnNldFZhbHVlKGl0ZW0pO1xuICAgICAgICAgICAgaXRlbVBhcnQuY29tbWl0KCk7XG4gICAgICAgICAgICBwYXJ0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdGhlIHBhcnRzIGFycmF5IHNvIF92YWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoaXRlbVBhcnQgJiYgaXRlbVBhcnQuZW5kTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXIoc3RhcnROb2RlID0gdGhpcy5zdGFydE5vZGUpIHtcbiAgICAgICAgcmVtb3ZlTm9kZXModGhpcy5zdGFydE5vZGUucGFyZW50Tm9kZSwgc3RhcnROb2RlLm5leHRTaWJsaW5nLCB0aGlzLmVuZE5vZGUpO1xuICAgIH1cbn1cbi8qKlxuICogSW1wbGVtZW50cyBhIGJvb2xlYW4gYXR0cmlidXRlLCByb3VnaGx5IGFzIGRlZmluZWQgaW4gdGhlIEhUTUxcbiAqIHNwZWNpZmljYXRpb24uXG4gKlxuICogSWYgdGhlIHZhbHVlIGlzIHRydXRoeSwgdGhlbiB0aGUgYXR0cmlidXRlIGlzIHByZXNlbnQgd2l0aCBhIHZhbHVlIG9mXG4gKiAnJy4gSWYgdGhlIHZhbHVlIGlzIGZhbHNleSwgdGhlIGF0dHJpYnV0ZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggIT09IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbiBhdHRyaWJ1dGVzIGNhbiBvbmx5IGNvbnRhaW4gYSBzaW5nbGUgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIHdoaWxlIChpc0RpcmVjdGl2ZSh0aGlzLl9wZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLl9wZW5kaW5nVmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSBub0NoYW5nZTtcbiAgICAgICAgICAgIGRpcmVjdGl2ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcGVuZGluZ1ZhbHVlID09PSBub0NoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gISF0aGlzLl9wZW5kaW5nVmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLm5hbWUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbn1cbi8qKlxuICogU2V0cyBhdHRyaWJ1dGUgdmFsdWVzIGZvciBQcm9wZXJ0eVBhcnRzLCBzbyB0aGF0IHRoZSB2YWx1ZSBpcyBvbmx5IHNldCBvbmNlXG4gKiBldmVuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJ0cyBmb3IgYSBwcm9wZXJ0eS5cbiAqXG4gKiBJZiBhbiBleHByZXNzaW9uIGNvbnRyb2xzIHRoZSB3aG9sZSBwcm9wZXJ0eSB2YWx1ZSwgdGhlbiB0aGUgdmFsdWUgaXMgc2ltcGx5XG4gKiBhc3NpZ25lZCB0byB0aGUgcHJvcGVydHkgdW5kZXIgY29udHJvbC4gSWYgdGhlcmUgYXJlIHN0cmluZyBsaXRlcmFscyBvclxuICogbXVsdGlwbGUgZXhwcmVzc2lvbnMsIHRoZW4gdGhlIHN0cmluZ3MgYXJlIGV4cHJlc3Npb25zIGFyZSBpbnRlcnBvbGF0ZWQgaW50b1xuICogYSBzdHJpbmcgZmlyc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUNvbW1pdHRlciBleHRlbmRzIEF0dHJpYnV0ZUNvbW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSwgc3RyaW5ncykge1xuICAgICAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzKTtcbiAgICAgICAgdGhpcy5zaW5nbGUgPVxuICAgICAgICAgICAgKHN0cmluZ3MubGVuZ3RoID09PSAyICYmIHN0cmluZ3NbMF0gPT09ICcnICYmIHN0cmluZ3NbMV0gPT09ICcnKTtcbiAgICB9XG4gICAgX2NyZWF0ZVBhcnQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHlQYXJ0KHRoaXMpO1xuICAgIH1cbiAgICBfZ2V0VmFsdWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNpbmdsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFydHNbMF0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRWYWx1ZSgpO1xuICAgIH1cbiAgICBjb21taXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRbdGhpcy5uYW1lXSA9IHRoaXMuX2dldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG59XG4vLyBEZXRlY3QgZXZlbnQgbGlzdGVuZXIgb3B0aW9ucyBzdXBwb3J0LiBJZiB0aGUgYGNhcHR1cmVgIHByb3BlcnR5IGlzIHJlYWRcbi8vIGZyb20gdGhlIG9wdGlvbnMgb2JqZWN0LCB0aGVuIG9wdGlvbnMgYXJlIHN1cHBvcnRlZC4gSWYgbm90LCB0aGVuIHRoZSB0aHJpZFxuLy8gYXJndW1lbnQgdG8gYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIGJvb2xlYW4gY2FwdHVyZVxuLy8gdmFsdWUgc28gd2Ugc2hvdWxkIG9ubHkgcGFzcyB0aGUgYGNhcHR1cmVgIHByb3BlcnR5LlxubGV0IGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IGZhbHNlO1xudHJ5IHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBnZXQgY2FwdHVyZSgpIHtcbiAgICAgICAgICAgIGV2ZW50T3B0aW9uc1N1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGVzdCcsIG9wdGlvbnMsIG9wdGlvbnMpO1xufVxuY2F0Y2ggKF9lKSB7XG59XG5leHBvcnQgY2xhc3MgRXZlbnRQYXJ0IHtcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBldmVudE5hbWUsIGV2ZW50Q29udGV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLmV2ZW50Q29udGV4dCA9IGV2ZW50Q29udGV4dDtcbiAgICAgICAgdGhpcy5fYm91bmRIYW5kbGVFdmVudCA9IChlKSA9PiB0aGlzLmhhbmRsZUV2ZW50KGUpO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wZW5kaW5nVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29tbWl0KCkge1xuICAgICAgICB3aGlsZSAoaXNEaXJlY3RpdmUodGhpcy5fcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gbm9DaGFuZ2U7XG4gICAgICAgICAgICBkaXJlY3RpdmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3BlbmRpbmdWYWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdMaXN0ZW5lciA9IHRoaXMuX3BlbmRpbmdWYWx1ZTtcbiAgICAgICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLnZhbHVlO1xuICAgICAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9IG5ld0xpc3RlbmVyID09IG51bGwgfHxcbiAgICAgICAgICAgIG9sZExpc3RlbmVyICE9IG51bGwgJiZcbiAgICAgICAgICAgICAgICAobmV3TGlzdGVuZXIuY2FwdHVyZSAhPT0gb2xkTGlzdGVuZXIuY2FwdHVyZSB8fFxuICAgICAgICAgICAgICAgICAgICBuZXdMaXN0ZW5lci5vbmNlICE9PSBvbGRMaXN0ZW5lci5vbmNlIHx8XG4gICAgICAgICAgICAgICAgICAgIG5ld0xpc3RlbmVyLnBhc3NpdmUgIT09IG9sZExpc3RlbmVyLnBhc3NpdmUpO1xuICAgICAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9IG5ld0xpc3RlbmVyICE9IG51bGwgJiYgKG9sZExpc3RlbmVyID09IG51bGwgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuICAgICAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSBnZXRPcHRpb25zKG5ld0xpc3RlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnROYW1lLCB0aGlzLl9ib3VuZEhhbmRsZUV2ZW50LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gbmV3TGlzdGVuZXI7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG5vQ2hhbmdlO1xuICAgIH1cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuY2FsbCh0aGlzLmV2ZW50Q29udGV4dCB8fCB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8gV2UgY29weSBvcHRpb25zIGJlY2F1c2Ugb2YgdGhlIGluY29uc2lzdGVudCBiZWhhdmlvciBvZiBicm93c2VycyB3aGVuIHJlYWRpbmdcbi8vIHRoZSB0aGlyZCBhcmd1bWVudCBvZiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci4gSUUxMSBkb2Vzbid0IHN1cHBvcnQgb3B0aW9uc1xuLy8gYXQgYWxsLiBDaHJvbWUgNDEgb25seSByZWFkcyBgY2FwdHVyZWAgaWYgdGhlIGFyZ3VtZW50IGlzIGFuIG9iamVjdC5cbmNvbnN0IGdldE9wdGlvbnMgPSAobykgPT4gbyAmJlxuICAgIChldmVudE9wdGlvbnNTdXBwb3J0ZWQgP1xuICAgICAgICB7IGNhcHR1cmU6IG8uY2FwdHVyZSwgcGFzc2l2ZTogby5wYXNzaXZlLCBvbmNlOiBvLm9uY2UgfSA6XG4gICAgICAgIG8uY2FwdHVyZSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0cy5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBBdHRyaWJ1dGVDb21taXR0ZXIsIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LCBFdmVudFBhcnQsIE5vZGVQYXJ0LCBQcm9wZXJ0eUNvbW1pdHRlciB9IGZyb20gJy4vcGFydHMuanMnO1xuLyoqXG4gKiBDcmVhdGVzIFBhcnRzIHdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3Ige1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXJ0cyBmb3IgYW4gYXR0cmlidXRlLXBvc2l0aW9uIGJpbmRpbmcsIGdpdmVuIHRoZSBldmVudCwgYXR0cmlidXRlXG4gICAgICogbmFtZSwgYW5kIHN0cmluZyBsaXRlcmFscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gbmFtZSAgVGhlIGF0dHJpYnV0ZSBuYW1lXG4gICAgICogQHBhcmFtIHN0cmluZ3MgVGhlIHN0cmluZyBsaXRlcmFscy4gVGhlcmUgYXJlIGFsd2F5cyBhdCBsZWFzdCB0d28gc3RyaW5ncyxcbiAgICAgKiAgIGV2ZW50IGZvciBmdWxseS1jb250cm9sbGVkIGJpbmRpbmdzIHdpdGggYSBzaW5nbGUgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBoYW5kbGVBdHRyaWJ1dGVFeHByZXNzaW9ucyhlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWVbMF07XG4gICAgICAgIGlmIChwcmVmaXggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgY29taXR0ZXIgPSBuZXcgUHJvcGVydHlDb21taXR0ZXIoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgc3RyaW5ncyk7XG4gICAgICAgICAgICByZXR1cm4gY29taXR0ZXIucGFydHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZWZpeCA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gW25ldyBFdmVudFBhcnQoZWxlbWVudCwgbmFtZS5zbGljZSgxKSwgb3B0aW9ucy5ldmVudENvbnRleHQpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJlZml4ID09PSAnPycpIHtcbiAgICAgICAgICAgIHJldHVybiBbbmV3IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0KGVsZW1lbnQsIG5hbWUuc2xpY2UoMSksIHN0cmluZ3MpXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21pdHRlciA9IG5ldyBBdHRyaWJ1dGVDb21taXR0ZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncyk7XG4gICAgICAgIHJldHVybiBjb21pdHRlci5wYXJ0cztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhcnRzIGZvciBhIHRleHQtcG9zaXRpb24gYmluZGluZy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVGYWN0b3J5XG4gICAgICovXG4gICAgaGFuZGxlVGV4dEV4cHJlc3Npb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVQYXJ0KG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgPSBuZXcgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcy5tYXAiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFBvbHltZXIgUHJvamVjdCBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBjb2RlIG1heSBvbmx5IGJlIHVzZWQgdW5kZXIgdGhlIEJTRCBzdHlsZSBsaWNlbnNlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQ09OVFJJQlVUT1JTLnR4dFxuICogQ29kZSBkaXN0cmlidXRlZCBieSBHb29nbGUgYXMgcGFydCBvZiB0aGUgcG9seW1lciBwcm9qZWN0IGlzIGFsc29cbiAqIHN1YmplY3QgdG8gYW4gYWRkaXRpb25hbCBJUCByaWdodHMgZ3JhbnQgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5pbXBvcnQgeyBtYXJrZXIsIFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG4vKipcbiAqIFRoZSBkZWZhdWx0IFRlbXBsYXRlRmFjdG9yeSB3aGljaCBjYWNoZXMgVGVtcGxhdGVzIGtleWVkIG9uXG4gKiByZXN1bHQudHlwZSBhbmQgcmVzdWx0LnN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUZhY3RvcnkocmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlQ2FjaGUgPSB0ZW1wbGF0ZUNhY2hlcy5nZXQocmVzdWx0LnR5cGUpO1xuICAgIGlmICh0ZW1wbGF0ZUNhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGVtcGxhdGVDYWNoZSA9IHtcbiAgICAgICAgICAgIHN0cmluZ3NBcnJheTogbmV3IFdlYWtNYXAoKSxcbiAgICAgICAgICAgIGtleVN0cmluZzogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgICAgIHRlbXBsYXRlQ2FjaGVzLnNldChyZXN1bHQudHlwZSwgdGVtcGxhdGVDYWNoZSk7XG4gICAgfVxuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuc3RyaW5nc0FycmF5LmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgVGVtcGxhdGVTdHJpbmdzQXJyYXkgaXMgbmV3LCBnZW5lcmF0ZSBhIGtleSBmcm9tIHRoZSBzdHJpbmdzXG4gICAgLy8gVGhpcyBrZXkgaXMgc2hhcmVkIGJldHdlZW4gYWxsIHRlbXBsYXRlcyB3aXRoIGlkZW50aWNhbCBjb250ZW50XG4gICAgY29uc3Qga2V5ID0gcmVzdWx0LnN0cmluZ3Muam9pbihtYXJrZXIpO1xuICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgaGF2ZSBhIFRlbXBsYXRlIGZvciB0aGlzIGtleVxuICAgIHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuZ2V0KGtleSk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBub3Qgc2VlbiB0aGlzIGtleSBiZWZvcmUsIGNyZWF0ZSBhIG5ldyBUZW1wbGF0ZVxuICAgICAgICB0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQsIHJlc3VsdC5nZXRUZW1wbGF0ZUVsZW1lbnQoKSk7XG4gICAgICAgIC8vIENhY2hlIHRoZSBUZW1wbGF0ZSBmb3IgdGhpcyBrZXlcbiAgICAgICAgdGVtcGxhdGVDYWNoZS5rZXlTdHJpbmcuc2V0KGtleSwgdGVtcGxhdGUpO1xuICAgIH1cbiAgICAvLyBDYWNoZSBhbGwgZnV0dXJlIHF1ZXJpZXMgZm9yIHRoaXMgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAgICB0ZW1wbGF0ZUNhY2hlLnN0cmluZ3NBcnJheS5zZXQocmVzdWx0LnN0cmluZ3MsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG59XG5leHBvcnQgY29uc3QgdGVtcGxhdGVDYWNoZXMgPSBuZXcgTWFwKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZS1mYWN0b3J5LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNyBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9MSUNFTlNFLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBhdXRob3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL1BBVEVOVFMudHh0XG4gKi9cbi8qKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICovXG5pbXBvcnQgeyByZW1vdmVOb2RlcyB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IE5vZGVQYXJ0IH0gZnJvbSAnLi9wYXJ0cy5qcyc7XG5pbXBvcnQgeyB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL3RlbXBsYXRlLWZhY3RvcnkuanMnO1xuZXhwb3J0IGNvbnN0IHBhcnRzID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogUmVuZGVycyBhIHRlbXBsYXRlIHRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRvIHVwZGF0ZSBhIGNvbnRhaW5lciB3aXRoIG5ldyB2YWx1ZXMsIHJlZXZhbHVhdGUgdGhlIHRlbXBsYXRlIGxpdGVyYWwgYW5kXG4gKiBjYWxsIGByZW5kZXJgIHdpdGggdGhlIG5ldyByZXN1bHQuXG4gKlxuICogQHBhcmFtIHJlc3VsdCBhIFRlbXBsYXRlUmVzdWx0IGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZyBsaWtlXG4gKiAgICAgYGh0bWxgIG9yIGBzdmdgLlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBwYXJlbnQgdG8gcmVuZGVyIHRvLiBUaGUgZW50aXJlIGNvbnRlbnRzIGFyZSBlaXRoZXJcbiAqICAgICByZXBsYWNlZCwgb3IgZWZmaWNpZW50bHkgdXBkYXRlZCBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXMgcHJldmlvdXNcbiAqICAgICByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFJlbmRlck9wdGlvbnMgZm9yIHRoZSBlbnRpcmUgcmVuZGVyIHRyZWUgcmVuZGVyZWQgdG8gdGhpc1xuICogICAgIGNvbnRhaW5lci4gUmVuZGVyIG9wdGlvbnMgbXVzdCAqbm90KiBjaGFuZ2UgYmV0d2VlbiByZW5kZXJzIHRvIHRoZSBzYW1lXG4gKiAgICAgY29udGFpbmVyLCBhcyB0aG9zZSBjaGFuZ2VzIHdpbGwgbm90IGVmZmVjdCBwcmV2aW91c2x5IHJlbmRlcmVkIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChyZXN1bHQsIGNvbnRhaW5lciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBwYXJ0ID0gcGFydHMuZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW1vdmVOb2Rlcyhjb250YWluZXIsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgcGFydHMuc2V0KGNvbnRhaW5lciwgcGFydCA9IG5ldyBOb2RlUGFydChPYmplY3QuYXNzaWduKHsgdGVtcGxhdGVGYWN0b3J5IH0sIG9wdGlvbnMpKSk7XG4gICAgICAgIHBhcnQuYXBwZW5kSW50byhjb250YWluZXIpO1xuICAgIH1cbiAgICBwYXJ0LnNldFZhbHVlKHJlc3VsdCk7XG4gICAgcGFydC5jb21taXQoKTtcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vQVVUSE9SUy50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgY29udHJpYnV0b3JzIG1heSBiZSBmb3VuZCBhdFxuICogaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0XG4gKiBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLyoqXG4gKlxuICogTWFpbiBsaXQtaHRtbCBtb2R1bGUuXG4gKlxuICogTWFpbiBleHBvcnRzOlxuICpcbiAqIC0gIFtbaHRtbF1dXG4gKiAtICBbW3N2Z11dXG4gKiAtICBbW3JlbmRlcl1dXG4gKlxuICogQG1vZHVsZSBsaXQtaHRtbFxuICogQHByZWZlcnJlZFxuICovXG4vKipcbiAqIERvIG5vdCByZW1vdmUgdGhpcyBjb21tZW50OyBpdCBrZWVwcyB0eXBlZG9jIGZyb20gbWlzcGxhY2luZyB0aGUgbW9kdWxlXG4gKiBkb2NzLlxuICovXG5pbXBvcnQgeyBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5pbXBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgRGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yLCBkZWZhdWx0VGVtcGxhdGVQcm9jZXNzb3IgfSBmcm9tICcuL2xpYi9kZWZhdWx0LXRlbXBsYXRlLXByb2Nlc3Nvci5qcyc7XG5leHBvcnQgeyBkaXJlY3RpdmUsIGlzRGlyZWN0aXZlIH0gZnJvbSAnLi9saWIvZGlyZWN0aXZlLmpzJztcbi8vIFRPRE8oanVzdGluZmFnbmFuaSk6IHJlbW92ZSBsaW5lIHdoZW4gd2UgZ2V0IE5vZGVQYXJ0IG1vdmluZyBtZXRob2RzXG5leHBvcnQgeyByZW1vdmVOb2RlcywgcmVwYXJlbnROb2RlcyB9IGZyb20gJy4vbGliL2RvbS5qcyc7XG5leHBvcnQgeyBub0NoYW5nZSwgbm90aGluZyB9IGZyb20gJy4vbGliL3BhcnQuanMnO1xuZXhwb3J0IHsgQXR0cmlidXRlQ29tbWl0dGVyLCBBdHRyaWJ1dGVQYXJ0LCBCb29sZWFuQXR0cmlidXRlUGFydCwgRXZlbnRQYXJ0LCBpc1ByaW1pdGl2ZSwgTm9kZVBhcnQsIFByb3BlcnR5Q29tbWl0dGVyLCBQcm9wZXJ0eVBhcnQgfSBmcm9tICcuL2xpYi9wYXJ0cy5qcyc7XG5leHBvcnQgeyBwYXJ0cywgcmVuZGVyIH0gZnJvbSAnLi9saWIvcmVuZGVyLmpzJztcbmV4cG9ydCB7IHRlbXBsYXRlQ2FjaGVzLCB0ZW1wbGF0ZUZhY3RvcnkgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1mYWN0b3J5LmpzJztcbmV4cG9ydCB7IFRlbXBsYXRlSW5zdGFuY2UgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1pbnN0YW5jZS5qcyc7XG5leHBvcnQgeyBTVkdUZW1wbGF0ZVJlc3VsdCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS1yZXN1bHQuanMnO1xuZXhwb3J0IHsgY3JlYXRlTWFya2VyLCBpc1RlbXBsYXRlUGFydEFjdGl2ZSwgVGVtcGxhdGUgfSBmcm9tICcuL2xpYi90ZW1wbGF0ZS5qcyc7XG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuLy8gVE9ETyhqdXN0aW5mYWduYW5pKTogaW5qZWN0IHZlcnNpb24gbnVtYmVyIGF0IGJ1aWxkIHRpbWVcbih3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddIHx8ICh3aW5kb3dbJ2xpdEh0bWxWZXJzaW9ucyddID0gW10pKS5wdXNoKCcxLjAuMCcpO1xuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnaHRtbCcsIGRlZmF1bHRUZW1wbGF0ZVByb2Nlc3Nvcik7XG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSAoc3RyaW5ncywgLi4udmFsdWVzKSA9PiBuZXcgU1ZHVGVtcGxhdGVSZXN1bHQoc3RyaW5ncywgdmFsdWVzLCAnc3ZnJywgZGVmYXVsdFRlbXBsYXRlUHJvY2Vzc29yKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpdC1odG1sLmpzLm1hcCIsIi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5IHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZU1hcHBlcjxUID0gYW55PiA9ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gVCB8IG51bGw7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgbWFwIGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gYXR0cmlidXRlIHZhbHVlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5TWFwcGVyPFQgPSBhbnk+ID0gKHZhbHVlOiBUIHwgbnVsbCkgPT4gc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBbiBvYmplY3QgdGhhdCBob2xkcyBhbiB7QGxpbmsgQXR0cmlidXRlTWFwcGVyfSBhbmQgYSB7QGxpbmsgUHJvcGVydHlNYXBwZXJ9XG4gKlxuICogQHJlbWFya3NcbiAqIEZvciB0aGUgbW9zdCBjb21tb24gdHlwZXMsIGEgY29udmVydGVyIGV4aXN0cyB3aGljaCBjYW4gYmUgcmVmZXJlbmNlZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgQHByb3BlcnR5KHtcbiAqICAgICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICogICAgICB9KVxuICogICAgICBteVByb3BlcnR5ID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZUNvbnZlcnRlcjxUID0gYW55PiB7XG4gICAgdG9BdHRyaWJ1dGU6IFByb3BlcnR5TWFwcGVyPFQ+O1xuICAgIGZyb21BdHRyaWJ1dGU6IEF0dHJpYnV0ZU1hcHBlcjxUPjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBhdHRyaWJ1dGUgY29udmVydGVyXG4gKlxuICogQHJlbWFya3NcbiAqIFRoaXMgY29udmVydGVyIGlzIHVzZWQgYXMgdGhlIGRlZmF1bHQgY29udmVydGVyIGZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB1bmxlc3MgYSBkaWZmZXJlbnQgb25lXG4gKiBpcyBzcGVjaWZpZWQuIFRoZSBjb252ZXJ0ZXIgdHJpZXMgdG8gaW5mZXIgdGhlIHByb3BlcnR5IHR5cGUgd2hlbiBjb252ZXJ0aW5nIHRvIGF0dHJpYnV0ZXMgYW5kXG4gKiB1c2VzIGBKU09OLnBhcnNlKClgIHdoZW4gY29udmVydGluZyBzdHJpbmdzIGZyb20gYXR0cmlidXRlcy4gSWYgYEpTT04ucGFyc2UoKWAgdGhyb3dzIGFuIGVycm9yLFxuICogdGhlIGNvbnZlcnRlciB3aWxsIHVzZSB0aGUgYXR0cmlidXRlIHZhbHVlIGFzIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyRGVmYXVsdDogQXR0cmlidXRlQ29udmVydGVyID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4ge1xuICAgICAgICAvLyBgSlNPTi5wYXJzZSgpYCB3aWxsIHRocm93IGFuIGVycm9yIGZvciBlbXB0eSBzdHJpbmdzIC0gd2UgY29uc2lkZXIgaXQgbnVsbFxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgc3VjY2Vzc2Z1bGx5IHBhcnNlIGBib29sZWFuYCwgYG51bWJlcmAgYW5kIGBKU09OLnN0cmluZ2lmeWAnZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCB0aHJvd3MsIGl0IG1lYW5zIHdlJ3JlIHByb2JhYmx5IGRlYWxpbmcgd2l0aCBhIHJlZ3VsYXIgc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgIH0sXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IG51bGw7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBudW1iZXIsIGJpZ2ludCwgc3ltYm9sLCBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckJvb2xlYW46IEF0dHJpYnV0ZUNvbnZlcnRlcjxib29sZWFuPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSAhPT0gbnVsbCksXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYm9vbGVhbiB8IG51bGwpID0+IHZhbHVlID8gJycgOiBudWxsXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmc6IEF0dHJpYnV0ZUNvbnZlcnRlcjxzdHJpbmc+ID0ge1xuICAgIGZyb21BdHRyaWJ1dGU6ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gKHZhbHVlID09PSBudWxsKSA/IG51bGwgOiB2YWx1ZSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWRcbiAgICB0b0F0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiB2YWx1ZVxufVxuXG5leHBvcnQgY29uc3QgQXR0cmlidXRlQ29udmVydGVyTnVtYmVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8bnVtYmVyPiA9IHtcbiAgICBmcm9tQXR0cmlidXRlOiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+ICh2YWx1ZSA9PT0gbnVsbCkgPyBudWxsIDogTnVtYmVyKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogbnVtYmVyIHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbmV4cG9ydCBjb25zdCBBdHRyaWJ1dGVDb252ZXJ0ZXJPYmplY3Q6IEF0dHJpYnV0ZUNvbnZlcnRlcjxvYmplY3Q+ID0ge1xuICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBKU09OLnBhcnNlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogb2JqZWN0IHwgbnVsbCkgPT4gKHZhbHVlID09IG51bGwpID8gdmFsdWUgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn1cblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckFycmF5OiBBdHRyaWJ1dGVDb252ZXJ0ZXI8YW55W10+ID0ge1xuICAgIC8vIGBKU09OLnBhcnNlKClgIHdpbGwgdGhyb3cgYW4gZXJyb3IgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBKU09OLnBhcnNlKHZhbHVlKSxcbiAgICAvLyBwYXNzIHRocm91Z2ggbnVsbCBvciB1bmRlZmluZWQgdXNpbmcgYHZhbHVlID09IG51bGxgXG4gICAgdG9BdHRyaWJ1dGU6ICh2YWx1ZTogYW55W10gfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufTtcblxuZXhwb3J0IGNvbnN0IEF0dHJpYnV0ZUNvbnZlcnRlckRhdGU6IEF0dHJpYnV0ZUNvbnZlcnRlcjxEYXRlPiA9IHtcbiAgICAvLyBgbmV3IERhdGUoKWAgd2lsbCByZXR1cm4gYW4gYEludmFsaWQgRGF0ZWAgZm9yIGVtcHR5IHN0cmluZ3MgLSB3ZSBjb25zaWRlciBpdCBudWxsXG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlOiBzdHJpbmcgfCBudWxsKSA9PiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSA/IG51bGwgOiBuZXcgRGF0ZSh2YWx1ZSksXG4gICAgLy8gcGFzcyB0aHJvdWdoIG51bGwgb3IgdW5kZWZpbmVkIHVzaW5nIGB2YWx1ZSA9PSBudWxsYFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWU6IERhdGUgfCBudWxsKSA9PiAodmFsdWUgPT0gbnVsbCkgPyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKClcbn1cbiIsImNvbnN0IEZJUlNUID0gL15bXl0vO1xuY29uc3QgU1BBQ0VTID0gL1xccysoW1xcU10pL2c7XG5jb25zdCBDQU1FTFMgPSAvW2Etel0oW0EtWl0pL2c7XG5jb25zdCBLRUJBQlMgPSAvLShbYS16XSkvZztcblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUgKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICAgIHJldHVybiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZShGSVJTVCwgc3RyaW5nWzBdLnRvVXBwZXJDYXNlKCkpIDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5jYXBpdGFsaXplIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnJlcGxhY2UoRklSU1QsIHN0cmluZ1swXS50b0xvd2VyQ2FzZSgpKSA6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbWVsQ2FzZSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgbGV0IG1hdGNoZXM7XG5cbiAgICBpZiAoc3RyaW5nKSB7XG5cbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnRyaW0oKTtcblxuICAgICAgICB3aGlsZSAoKG1hdGNoZXMgPSBTUEFDRVMuZXhlYyhzdHJpbmcpKSkge1xuXG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShtYXRjaGVzWzBdLCBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBTUEFDRVMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IEtFQkFCUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMV0udG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIEtFQkFCUy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuY2FwaXRhbGl6ZShzdHJpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ga2ViYWJDYXNlIChzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgbWF0Y2hlcztcblxuICAgIGlmIChzdHJpbmcpIHtcblxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcudHJpbSgpO1xuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IFNQQUNFUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sICctJyArIG1hdGNoZXNbMV0pO1xuXG4gICAgICAgICAgICBTUEFDRVMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlICgobWF0Y2hlcyA9IENBTUVMUy5leGVjKHN0cmluZykpKSB7XG5cbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoZXNbMF0sIG1hdGNoZXNbMF1bMF0gKyAnLScgKyBtYXRjaGVzWzFdKTtcblxuICAgICAgICAgICAgQ0FNRUxTLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nID8gc3RyaW5nLnRvTG93ZXJDYXNlKCkgOiBzdHJpbmc7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyLCBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0IH0gZnJvbSAnLi9hdHRyaWJ1dGUtY29udmVydGVyJztcbmltcG9ydCB7IGtlYmFiQ2FzZSB9IGZyb20gJy4vdXRpbHMvc3RyaW5nLXV0aWxzJztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZWZsZWN0IGFuIGF0dHJpYnV0ZSB2YWx1ZSB0byBhIHByb3BlcnR5XG4gKi9cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZVJlZmxlY3RvcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcgfCBudWxsLCBuZXdWYWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCByZWZsZWN0IGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gYXR0cmlidXRlXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5UmVmbGVjdG9yPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+ID0gKHRoaXM6IFR5cGUsIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBkaXNwYXRjaCBhIGN1c3RvbSBldmVudCBmb3IgYSBwcm9wZXJ0eSBjaGFuZ2VcbiAqL1xuZXhwb3J0IHR5cGUgUHJvcGVydHlOb3RpZmllcjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiA9ICh0aGlzOiBUeXBlLCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHdpbGwgcmV0dXJuIGB0cnVlYCBpZiB0aGUgYG9sZFZhbHVlYCBhbmQgdGhlIGBuZXdWYWx1ZWAgb2YgYSBwcm9wZXJ0eSBhcmUgZGlmZmVyZW50LCBgZmFsc2VgIG90aGVyd2lzZVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eUNoYW5nZURldGVjdG9yID0gKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciB7QGxpbmsgQXR0cmlidXRlUmVmbGVjdG9yfVxuICpcbiAqIEBwYXJhbSByZWZsZWN0b3IgQSByZWZsZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBdHRyaWJ1dGVSZWZsZWN0b3IgKHJlZmxlY3RvcjogYW55KTogcmVmbGVjdG9yIGlzIEF0dHJpYnV0ZVJlZmxlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIHJlZmxlY3RvciA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAqXG4gKiBAcGFyYW0gcmVmbGVjdG9yIEEgcmVmbGVjdG9yIHRvIHRlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHlSZWZsZWN0b3IgKHJlZmxlY3RvcjogYW55KTogcmVmbGVjdG9yIGlzIFByb3BlcnR5UmVmbGVjdG9yIHtcblxuICAgIHJldHVybiB0eXBlb2YgcmVmbGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9XG4gKlxuICogQHBhcmFtIG5vdGlmaWVyIEEgbm90aWZpZXIgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eU5vdGlmaWVyIChub3RpZmllcjogYW55KTogbm90aWZpZXIgaXMgUHJvcGVydHlOb3RpZmllciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIG5vdGlmaWVyID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gKlxuICogQHBhcmFtIGRldGVjdG9yIEEgZGV0ZWN0b3IgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eUNoYW5nZURldGVjdG9yIChkZXRlY3RvcjogYW55KTogZGV0ZWN0b3IgaXMgUHJvcGVydHlDaGFuZ2VEZXRlY3RvciB7XG5cbiAgICByZXR1cm4gdHlwZW9mIGRldGVjdG9yID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3Ige0BsaW5rIFByb3BlcnR5S2V5fVxuICpcbiAqIEBwYXJhbSBrZXkgQSBwcm9wZXJ0eSBrZXkgdG8gdGVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eUtleSAoa2V5OiBhbnkpOiBrZXkgaXMgUHJvcGVydHlLZXkge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBrZXkgPT09ICdudW1iZXInIHx8IHR5cGVvZiBrZXkgPT09ICdzeW1ib2wnO1xufVxuXG4vKipcbiAqIEVuY29kZXMgYSBzdHJpbmcgZm9yIHVzZSBhcyBodG1sIGF0dHJpYnV0ZSByZW1vdmluZyBpbnZhbGlkIGF0dHJpYnV0ZSBjaGFyYWN0ZXJzXG4gKlxuICogQHBhcmFtIHZhbHVlIEEgc3RyaW5nIHRvIGVuY29kZSBmb3IgdXNlIGFzIGh0bWwgYXR0cmlidXRlXG4gKiBAcmV0dXJucyAgICAgQW4gZW5jb2RlZCBzdHJpbmcgdXNhYmxlIGFzIGh0bWwgYXR0cmlidXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVBdHRyaWJ1dGUgKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuXG4gICAgcmV0dXJuIGtlYmFiQ2FzZSh2YWx1ZS5yZXBsYWNlKC9cXFcrL2csICctJykucmVwbGFjZSgvXFwtJC8sICcnKSk7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGF0dHJpYnV0ZSBuYW1lIGZyb20gYSBwcm9wZXJ0eSBrZXlcbiAqXG4gKiBAcmVtYXJrc1xuICogTnVtZXJpYyBwcm9wZXJ0eSBpbmRleGVzIG9yIHN5bWJvbHMgY2FuIGNvbnRhaW4gaW52YWxpZCBjaGFyYWN0ZXJzIGZvciBhdHRyaWJ1dGUgbmFtZXMuIFRoaXMgbWV0aG9kXG4gKiBzYW5pdGl6ZXMgdGhvc2UgY2hhcmFjdGVycyBhbmQgcmVwbGFjZXMgc2VxdWVuY2VzIG9mIGludmFsaWQgY2hhcmFjdGVycyB3aXRoIGEgZGFzaC5cbiAqIEF0dHJpYnV0ZSBuYW1lcyBhcmUgbm90IGFsbG93ZWQgdG8gc3RhcnQgd2l0aCBudW1iZXJzIGVpdGhlciBhbmQgYXJlIHByZWZpeGVkIHdpdGggJ2F0dHItJy5cbiAqXG4gKiBOLkIuOiBXaGVuIHVzaW5nIGN1c3RvbSBzeW1ib2xzIGFzIHByb3BlcnR5IGtleXMsIHVzZSB1bmlxdWUgZGVzY3JpcHRpb25zIGZvciB0aGUgc3ltYm9scyB0byBhdm9pZFxuICogY2xhc2hpbmcgYXR0cmlidXRlIG5hbWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IGEgPSBTeW1ib2woKTtcbiAqIGNvbnN0IGIgPSBTeW1ib2woKTtcbiAqXG4gKiBhICE9PSBiOyAvLyB0cnVlXG4gKlxuICogY3JlYXRlQXR0cmlidXRlTmFtZShhKSAhPT0gY3JlYXRlQXR0cmlidXRlTmFtZShiKTsgLy8gZmFsc2UgLS0+ICdhdHRyLXN5bWJvbCcgPT09ICdhdHRyLXN5bWJvbCdcbiAqXG4gKiBjb25zdCBjID0gU3ltYm9sKCdjJyk7XG4gKiBjb25zdCBkID0gU3ltYm9sKCdkJyk7XG4gKlxuICogYyAhPT0gZDsgLy8gdHJ1ZVxuICpcbiAqIGNyZWF0ZUF0dHJpYnV0ZU5hbWUoYykgIT09IGNyZWF0ZUF0dHJpYnV0ZU5hbWUoZCk7IC8vIHRydWUgLS0+ICdhdHRyLXN5bWJvbC1jJyA9PT0gJ2F0dHItc3ltYm9sLWQnXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBBIHByb3BlcnR5IGtleSB0byBjb252ZXJ0IHRvIGFuIGF0dHJpYnV0ZSBuYW1lXG4gKiBAcmV0dXJucyAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIGF0dHJpYnV0ZSBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVOYW1lIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBzdHJpbmcge1xuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0eUtleSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICByZXR1cm4ga2ViYWJDYXNlKHByb3BlcnR5S2V5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpcyBjb3VsZCBjcmVhdGUgbXVsdGlwbGUgaWRlbnRpY2FsIGF0dHJpYnV0ZSBuYW1lcywgaWYgc3ltYm9scyBkb24ndCBoYXZlIHVuaXF1ZSBkZXNjcmlwdGlvblxuICAgICAgICByZXR1cm4gYGF0dHItJHsgZW5jb2RlQXR0cmlidXRlKFN0cmluZyhwcm9wZXJ0eUtleSkpIH1gO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYW4gZXZlbnQgbmFtZSBmcm9tIGEgcHJvcGVydHkga2V5XG4gKlxuICogQHJlbWFya3NcbiAqIEV2ZW50IG5hbWVzIGRvbid0IGhhdmUgdGhlIHNhbWUgcmVzdHJpY3Rpb25zIGFzIGF0dHJpYnV0ZSBuYW1lcyB3aGVuIGl0IGNvbWVzIHRvIGludmFsaWRcbiAqIGNoYXJhY3RlcnMuIEhvd2V2ZXIsIGZvciBjb25zaXN0ZW5jeSdzIHNha2UsIHdlIGFwcGx5IHRoZSBzYW1lIHJ1bGVzIGZvciBldmVudCBuYW1lcyBhc1xuICogZm9yIGF0dHJpYnV0ZSBuYW1lcy5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBBIHByb3BlcnR5IGtleSB0byBjb252ZXJ0IHRvIGFuIGF0dHJpYnV0ZSBuYW1lXG4gKiBAcGFyYW0gcHJlZml4ICAgICAgICBBbiBvcHRpb25hbCBwcmVmaXgsIGUuZy46ICdvbidcbiAqIEBwYXJhbSBzdWZmaXggICAgICAgIEFuIG9wdGlvbmFsIHN1ZmZpeCwgZS5nLjogJ2NoYW5nZWQnXG4gKiBAcmV0dXJucyAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIGV2ZW50IG5hbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50TmFtZSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBwcmVmaXg/OiBzdHJpbmcsIHN1ZmZpeD86IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICBsZXQgcHJvcGVydHlTdHJpbmcgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvcGVydHlLZXkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgcHJvcGVydHlTdHJpbmcgPSBrZWJhYkNhc2UocHJvcGVydHlLZXkpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBUT0RPOiB0aGlzIGNvdWxkIGNyZWF0ZSBtdWx0aXBsZSBpZGVudGljYWwgZXZlbnQgbmFtZXMsIGlmIHN5bWJvbHMgZG9uJ3QgaGF2ZSB1bmlxdWUgZGVzY3JpcHRpb25cbiAgICAgICAgcHJvcGVydHlTdHJpbmcgPSBlbmNvZGVBdHRyaWJ1dGUoU3RyaW5nKHByb3BlcnR5S2V5KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAkeyBwcmVmaXggPyBgJHsga2ViYWJDYXNlKHByZWZpeCkgfS1gIDogJycgfSR7IHByb3BlcnR5U3RyaW5nIH0keyBzdWZmaXggPyBgLSR7IGtlYmFiQ2FzZShzdWZmaXgpIH1gIDogJycgfWA7XG59XG5cbi8qKlxuICogQSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5RGVjbGFyYXRpb248VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4ge1xuICAgIC8qKlxuICAgICAqIERvZXMgcHJvcGVydHkgaGF2ZSBhbiBhc3NvY2lhdGVkIGF0dHJpYnV0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogTm8gYXR0cmlidXRlIHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcHJvcGVydHlcbiAgICAgKiAqIGB0cnVlYDogVGhlIGF0dHJpYnV0ZSBuYW1lIHdpbGwgYmUgaW5mZXJyZWQgYnkgY2FtZWwtY2FzaW5nIHRoZSBwcm9wZXJ0eSBuYW1lXG4gICAgICogKiBgc3RyaW5nYDogVXNlIHRoZSBwcm92aWRlZCBzdHJpbmcgYXMgdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIG5hbWVcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIGF0dHJpYnV0ZTogYm9vbGVhbiB8IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEN1c3RvbWl6ZSB0aGUgY29udmVyc2lvbiBvZiB2YWx1ZXMgYmV0d2VlbiBwcm9wZXJ0eSBhbmQgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQ29udmVydGVycyBhcmUgb25seSB1c2VkIHdoZW4ge0BsaW5rIHJlZmxlY3RQcm9wZXJ0eX0gYW5kL29yIHtAbGluayByZWZsZWN0QXR0cmlidXRlfSBhcmUgc2V0IHRvIHRydWUuXG4gICAgICogSWYgY3VzdG9tIHJlZmxlY3RvcnMgYXJlIHVzZWQsIHRoZXkgaGF2ZSB0byB0YWtlIGNhcmUgb3IgY29udmVydGluZyB0aGUgcHJvcGVydHkvYXR0cmlidXRlIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IHtAbGluayBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0fVxuICAgICAqL1xuICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyO1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSdzIHZhbHVlIGJlIGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkIHRvIHRoZSBwcm9wZXJ0eT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogVGhlIGF0dHJpYnV0ZSB2YWx1ZSB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgdG8gdGhlIHByb3BlcnR5IGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGB0cnVlYDogQW55IGF0dHJpYnV0ZSBjaGFuZ2Ugd2lsbCBiZSByZWZsZWN0ZWQgYXV0b21hdGljYWxseSB0byB0aGUgcHJvcGVydHkgdXNpbmcgdGhlIGRlZmF1bHQgYXR0cmlidXRlIHJlZmxlY3RvclxuICAgICAqICogYFByb3BlcnR5S2V5YDogQSBtZXRob2Qgb24gdGhlIGNvbXBvbmVudCB3aXRoIHRoYXQgcHJvcGVydHkga2V5IHdpbGwgYmUgaW52b2tlZCB0byBoYW5kbGUgdGhlIGF0dHJpYnV0ZSByZWZsZWN0aW9uXG4gICAgICogKiBgRnVuY3Rpb25gOiBUaGUgcHJvdmlkZWQgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIHdpdGggaXRzIGB0aGlzYCBjb250ZXh0IGJvdW5kIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHJlZmxlY3RBdHRyaWJ1dGU6IGJvb2xlYW4gfCBrZXlvZiBUeXBlIHwgQXR0cmlidXRlUmVmbGVjdG9yPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIHRoZSBwcm9wZXJ0eSB2YWx1ZSBiZSBhdXRvbWF0aWNhbGx5IHJlZmxlY3RlZCB0byB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGU/XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFBvc3NpYmxlIHZhbHVlczpcbiAgICAgKiAqIGBmYWxzZWA6IFRoZSBwcm9wZXJ0eSB2YWx1ZSB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgdG8gdGhlIGFzc29jaWF0ZWQgYXR0cmlidXRlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGB0cnVlYDogQW55IHByb3BlcnR5IGNoYW5nZSB3aWxsIGJlIHJlZmxlY3RlZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSBhc3NvY2lhdGVkIGF0dHJpYnV0ZSB1c2luZyB0aGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IEEgbWV0aG9kIG9uIHRoZSBjb21wb25lbnQgd2l0aCB0aGF0IHByb3BlcnR5IGtleSB3aWxsIGJlIGludm9rZWQgdG8gaGFuZGxlIHRoZSBwcm9wZXJ0eSByZWZsZWN0aW9uXG4gICAgICogKiBgRnVuY3Rpb25gOiBUaGUgcHJvdmlkZWQgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIHdpdGggaXRzIGB0aGlzYCBjb250ZXh0IGJvdW5kIHRvIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIHJlZmxlY3RQcm9wZXJ0eTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBQcm9wZXJ0eVJlZmxlY3RvcjxUeXBlPjtcblxuICAgIC8qKlxuICAgICAqIFNob3VsZCBhIHByb3BlcnR5IHZhbHVlIGNoYW5nZSByYWlzZSBhIGN1c3RvbSBldmVudD9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogRG9uJ3QgY3JlYXRlIGEgY3VzdG9tIGV2ZW50IGZvciB0aGlzIHByb3BlcnR5XG4gICAgICogKiBgdHJ1ZWA6IENyZWF0ZSBjdXN0b20gZXZlbnRzIGZvciB0aGlzIHByb3BlcnR5IGF1dG9tYXRpY2FsbHlcbiAgICAgKiAqIGBQcm9wZXJ0eUtleWA6IFVzZSB0aGUgbWV0aG9kIHdpdGggdGhpcyBwcm9wZXJ0eSBrZXkgb24gdGhlIGNvbXBvbmVudCB0byBjcmVhdGUgY3VzdG9tIGV2ZW50c1xuICAgICAqICogYEZ1bmN0aW9uYDogVXNlIHRoZSB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gdG8gY3JlYXRlIGN1c3RvbSBldmVudHMgKGB0aGlzYCBjb250ZXh0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSlcbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB0cnVlYFxuICAgICAqL1xuICAgIG5vdGlmeTogYm9vbGVhbiB8IGtleW9mIFR5cGUgfCBQcm9wZXJ0eU5vdGlmaWVyPFR5cGU+O1xuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlIGhvdyBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIG1vbml0b3JlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBCeSBkZWZhdWx0IGEgZGVjb3JhdGVkIHByb3BlcnR5IHdpbGwgYmUgb2JzZXJ2ZWQgZm9yIGNoYW5nZXMgKHRocm91Z2ggYSBjdXN0b20gc2V0dGVyIGZvciB0aGUgcHJvcGVydHkpLlxuICAgICAqIEFueSBgc2V0YC1vcGVyYXRpb24gb2YgdGhpcyBwcm9wZXJ0eSB3aWxsIHRoZXJlZm9yZSByZXF1ZXN0IGFuIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50IGFuZCBpbml0aWF0ZVxuICAgICAqIGEgcmVuZGVyIGFzIHdlbGwgYXMgcmVmbGVjdGlvbiBhbmQgbm90aWZpY2F0aW9uLlxuICAgICAqXG4gICAgICogUG9zc2libGUgdmFsdWVzOlxuICAgICAqICogYGZhbHNlYDogRG9uJ3Qgb2JzZXJ2ZSBjaGFuZ2VzIG9mIHRoaXMgcHJvcGVydHkgKHRoaXMgd2lsbCBieXBhc3MgcmVuZGVyLCByZWZsZWN0aW9uIGFuZCBub3RpZmljYXRpb24pXG4gICAgICogKiBgdHJ1ZWA6IE9ic2VydmUgY2hhbmdlcyBvZiB0aGlzIHByb3BlcnR5IHVzaW5nIHRoZSB7QGxpbmsgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1J9XG4gICAgICogKiBgRnVuY3Rpb25gOiBVc2UgdGhlIHByb3ZpZGVkIG1ldGhvZCB0byBjaGVjayBpZiBwcm9wZXJ0eSB2YWx1ZSBoYXMgY2hhbmdlZFxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgICh1c2VzIHtAbGluayBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUn0gaW50ZXJuYWxseSlcbiAgICAgKi9cbiAgICBvYnNlcnZlOiBib29sZWFuIHwgUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcjtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3JcbiAqXG4gKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICogQHJldHVybnMgICAgICAgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgcHJvcGVydHkgdmFsdWUgY2hhbmdlZFxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUk9QRVJUWV9DSEFOR0VfREVURUNUT1I6IFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3IgPSAob2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkgPT4ge1xuICAgIC8vIGluIGNhc2UgYG9sZFZhbHVlYCBhbmQgYG5ld1ZhbHVlYCBhcmUgYE5hTmAsIGAoTmFOICE9PSBOYU4pYCByZXR1cm5zIGB0cnVlYCxcbiAgICAvLyBidXQgYChOYU4gPT09IE5hTiB8fCBOYU4gPT09IE5hTilgIHJldHVybnMgYGZhbHNlYFxuICAgIHJldHVybiBvbGRWYWx1ZSAhPT0gbmV3VmFsdWUgJiYgKG9sZFZhbHVlID09PSBvbGRWYWx1ZSB8fCBuZXdWYWx1ZSA9PT0gbmV3VmFsdWUpO1xufTtcblxuLy8gVE9ETzogbWF5YmUgcHJvdmlkZSBmbGF0IGFycmF5L29iamVjdCBjaGFuZ2UgZGV0ZWN0b3I/IGRhdGUgY2hhbmdlIGRldGVjdG9yP1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBQcm9wZXJ0eURlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTjogUHJvcGVydHlEZWNsYXJhdGlvbiA9IHtcbiAgICBhdHRyaWJ1dGU6IHRydWUsXG4gICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJEZWZhdWx0LFxuICAgIHJlZmxlY3RBdHRyaWJ1dGU6IHRydWUsXG4gICAgcmVmbGVjdFByb3BlcnR5OiB0cnVlLFxuICAgIG5vdGlmeTogdHJ1ZSxcbiAgICBvYnNlcnZlOiBERUZBVUxUX1BST1BFUlRZX0NIQU5HRV9ERVRFQ1RPUixcbn07XG4iLCJpbXBvcnQgeyByZW5kZXIsIFRlbXBsYXRlUmVzdWx0IH0gZnJvbSAnbGl0LWh0bWwnO1xuaW1wb3J0IHsgTGlzdGVuZXJEZWNsYXJhdGlvbiB9IGZyb20gJy4vZGVjb3JhdG9ycy9saXN0ZW5lcic7XG5pbXBvcnQgeyBBdHRyaWJ1dGVSZWZsZWN0b3IsIGNyZWF0ZUV2ZW50TmFtZSwgaXNBdHRyaWJ1dGVSZWZsZWN0b3IsIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3RvciwgaXNQcm9wZXJ0eUtleSwgaXNQcm9wZXJ0eU5vdGlmaWVyLCBpc1Byb3BlcnR5UmVmbGVjdG9yLCBQcm9wZXJ0eURlY2xhcmF0aW9uLCBQcm9wZXJ0eU5vdGlmaWVyLCBQcm9wZXJ0eVJlZmxlY3RvciB9IGZyb20gXCIuL2RlY29yYXRvcnMvcHJvcGVydHktZGVjbGFyYXRpb25cIjtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUiA9IChhdHRyaWJ1dGVSZWZsZWN0b3I6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIGF0dHJpYnV0ZSByZWZsZWN0b3IgJHsgU3RyaW5nKGF0dHJpYnV0ZVJlZmxlY3RvcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUiA9IChwcm9wZXJ0eVJlZmxlY3RvcjogUHJvcGVydHlLZXkgfCBGdW5jdGlvbikgPT4gbmV3IEVycm9yKGBFcnJvciBleGVjdXRpbmcgcHJvcGVydHkgcmVmbGVjdG9yICR7IFN0cmluZyhwcm9wZXJ0eVJlZmxlY3RvcikgfS5gKTtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IFBST1BFUlRZX05PVElGSUVSX0VSUk9SID0gKHByb3BlcnR5Tm90aWZpZXI6IFByb3BlcnR5S2V5IHwgRnVuY3Rpb24pID0+IG5ldyBFcnJvcihgRXJyb3IgZXhlY3V0aW5nIHByb3BlcnR5IG5vdGlmaWVyICR7IFN0cmluZyhwcm9wZXJ0eU5vdGlmaWVyKSB9LmApO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgQ0hBTkdFX0RFVEVDVE9SX0VSUk9SID0gKGNoYW5nZURldGVjdG9yOiBQcm9wZXJ0eUtleSB8IEZ1bmN0aW9uKSA9PiBuZXcgRXJyb3IoYEVycm9yIGV4ZWN1dGluZyBwcm9wZXJ0eSBjaGFuZ2UgZGV0ZWN0b3IgJHsgU3RyaW5nKGNoYW5nZURldGVjdG9yKSB9LmApO1xuXG4vKipcbiAqIEV4dGVuZHMgdGhlIHN0YXRpYyB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gdG8gaW5jbHVkZSB0aGUgYm91bmQgbGlzdGVuZXJcbiAqIGZvciBhIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuaW50ZXJmYWNlIEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbiBleHRlbmRzIExpc3RlbmVyRGVjbGFyYXRpb24ge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJvdW5kIGxpc3RlbmVyIHdpbGwgYmUgc3RvcmVkIGhlcmUsIHNvIGl0IGNhbiBiZSByZW1vdmVkIGl0IGxhdGVyXG4gICAgICovXG4gICAgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXZlbnQgdGFyZ2V0IHdpbGwgYWx3YXlzIGJlIHJlc29sdmVkIHRvIGFuIGFjdHVhbCB7QGxpbmsgRXZlbnRUYXJnZXR9XG4gICAgICovXG4gICAgdGFyZ2V0OiBFdmVudFRhcmdldDtcbn1cblxuLyoqXG4gKiBBIHR5cGUgZm9yIHByb3BlcnR5IGNoYW5nZXMsIGFzIHVzZWQgaW4gJHtAbGluayBDb21wb25lbnQudXBkYXRlQ2FsbGJhY2t9XG4gKi9cbmV4cG9ydCB0eXBlIENoYW5nZXMgPSBNYXA8UHJvcGVydHlLZXksIGFueT47XG5cbi8qKlxuICogVGhlIGNvbXBvbmVudCBiYXNlIGNsYXNzXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBDU1NTdHlsZVNoZWV0fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVTaGVldDogQ1NTU3R5bGVTaGVldCB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB7QGxpbmsgQ1NTU3R5bGVTaGVldH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogV2hlbiBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFyZSBhdmFpbGFibGUsIHRoaXMgZ2V0dGVyIHdpbGwgY3JlYXRlIGEge0BsaW5rIENTU1N0eWxlU2hlZXR9XG4gICAgICogaW5zdGFuY2UgYW5kIGNhY2hlIGl0IGZvciB1c2Ugd2l0aCBlYWNoIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZVNoZWV0ICgpOiBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBpZiAodGhpcy5zdHlsZXMubGVuZ3RoICYmICF0aGlzLmhhc093blByb3BlcnR5KCdfc3R5bGVTaGVldCcpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBzdHlsZSBzaGVldCBhbmQgY2FjaGUgaXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQgPSBuZXcgQ1NTU3R5bGVTaGVldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0eWxlU2hlZXQucmVwbGFjZVN5bmModGhpcy5zdHlsZXMuam9pbignXFxuJykpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgeyB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3R5bGVTaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgY2FjaGVkIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBpbnN0YW5jZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBfc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGdldHRlciB3aWxsIGNyZWF0ZSBhIHtAbGluayBIVE1MU3R5bGVFbGVtZW50fSBub2RlIGFuZCBjYWNoZSBpdCBmb3IgdXNlIHdpdGggZWFjaFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGdldCBzdHlsZUVsZW1lbnQgKCk6IEhUTUxTdHlsZUVsZW1lbnQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcy5sZW5ndGggJiYgIXRoaXMuaGFzT3duUHJvcGVydHkoJ19zdHlsZUVsZW1lbnQnKSkge1xuXG4gICAgICAgICAgICB0aGlzLl9zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgdGhpcy5fc3R5bGVFbGVtZW50LnRpdGxlID0gdGhpcy5zZWxlY3RvcjtcbiAgICAgICAgICAgIHRoaXMuX3N0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuc3R5bGVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0eWxlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBhdHRyaWJ1dGUgbmFtZXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydHkga2V5c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICogcHJvcGVydHkga2V5IHRoYXQgYmVsb25ncyB0byBhbiBhdHRyaWJ1dGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBQcm9wZXJ0eUtleT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBvZiBwcm9wZXJ0eSBrZXlzIGFuZCB0aGVpciByZXNwZWN0aXZlIHByb3BlcnR5IGRlY2xhcmF0aW9uc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1hcCBpcyBwb3B1bGF0ZWQgYnkgdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yIGFuZCBjYW4gYmUgdXNlZCB0byBvYnRhaW4gdGhlXG4gICAgICoge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IG9mIGEgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgcHJvcGVydGllczogTWFwPFByb3BlcnR5S2V5LCBQcm9wZXJ0eURlY2xhcmF0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEEgbWFwIG9mIHByb3BlcnR5IGtleXMgYW5kIHRoZWlyIHJlc3BlY3RpdmUgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBieSB0aGUge0BsaW5rIHByb3BlcnR5fSBkZWNvcmF0b3IgYW5kIGNhbiBiZSB1c2VkIHRvIG9idGFpbiB0aGVcbiAgICAgKiB7QGxpbmsgTGlzdGVuZXJEZWNsYXJhdGlvbn0gb2YgYSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzdGF0aWMgbGlzdGVuZXJzOiBNYXA8UHJvcGVydHlLZXksIExpc3RlbmVyRGVjbGFyYXRpb24+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHNlbGVjdG9yXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFdpbGwgYmUgb3ZlcnJpZGRlbiBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNlbGVjdG9yYCBvcHRpb24sIGlmIHByb3ZpZGVkLlxuICAgICAqIE90aGVyd2lzZSB0aGUgZGVjb3JhdG9yIHdpbGwgdXNlIHRoaXMgcHJvcGVydHkgdG8gZGVmaW5lIHRoZSBjb21wb25lbnQuXG4gICAgICovXG4gICAgc3RhdGljIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBVc2UgU2hhZG93IERPTVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaWxsIGJlIHNldCBieSB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHNoYWRvd2Agb3B0aW9uIChkZWZhdWx0cyB0byBgdHJ1ZWApLlxuICAgICAqL1xuICAgIHN0YXRpYyBzaGFkb3c6IGJvb2xlYW47XG5cbiAgICAvLyBUT0RPOiBjcmVhdGUgdGVzdHMgZm9yIHN0eWxlIGluaGVyaXRhbmNlXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHN0eWxlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBDYW4gYmUgc2V0IHRocm91Z2ggdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvcidzIGBzdHlsZXNgIG9wdGlvbiAoZGVmYXVsdHMgdG8gYHVuZGVmaW5lZGApLlxuICAgICAqIFN0eWxlcyBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSBjbGFzcydzIHN0YXRpYyBwcm9wZXJ0eS5cbiAgICAgKiBUaGlzIGFsbG93cyB0byBpbmhlcml0IHN0eWxlcyBmcm9tIGEgcGFyZW50IGNvbXBvbmVudCBhbmQgYWRkIGFkZGl0aW9uYWwgc3R5bGVzIG9uIHRoZSBjaGlsZCBjb21wb25lbnQuXG4gICAgICogSW4gb3JkZXIgdG8gaW5oZXJpdCBzdHlsZXMgZnJvbSBhIHBhcmVudCBjb21wb25lbnQsIGFuIGV4cGxpY2l0IHN1cGVyIGNhbGwgaGFzIHRvIGJlIGluY2x1ZGVkLiBCeVxuICAgICAqIGRlZmF1bHQgbm8gc3R5bGVzIGFyZSBpbmhlcml0ZWQuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBNeUJhc2VFbGVtZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcbiAgICAgKlxuICAgICAqICAgICAgICAgIHJldHVybiBbXG4gICAgICogICAgICAgICAgICAgIC4uLnN1cGVyLnN0eWxlcyxcbiAgICAgKiAgICAgICAgICAgICAgJzpob3N0IHsgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47IH0nXG4gICAgICogICAgICAgICAgXTtcbiAgICAgKiAgICAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCk6IHN0cmluZ1tdIHtcblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIENhbiBiZSBzZXQgdGhyb3VnaCB0aGUge0BsaW5rIGNvbXBvbmVudH0gZGVjb3JhdG9yJ3MgYHRlbXBsYXRlYCBvcHRpb24gKGRlZmF1bHRzIHRvIGB1bmRlZmluZWRgKS5cbiAgICAgKiBJZiBzZXQgaW4gdGhlIHtAbGluayBjb21wb25lbnR9IGRlY29yYXRvciwgaXQgd2lsbCBoYXZlIHByZWNlZGVuY2Ugb3ZlciB0aGUgY2xhc3MncyBzdGF0aWMgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAgIFRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gaGVscGVycyAgIEFueSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgd2hpY2ggc2hvdWxkIGV4aXN0IGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHN0YXRpYyB0ZW1wbGF0ZT86IChlbGVtZW50OiBhbnksIC4uLmhlbHBlcnM6IGFueVtdKSA9PiBUZW1wbGF0ZVJlc3VsdCB8IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0byBzcGVjaWZ5IGF0dHJpYnV0ZXMgd2hpY2ggc2hvdWxkIGJlIG9ic2VydmVkLCBidXQgZG9uJ3QgaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcmVtYXJrXG4gICAgICogRm9yIHByb3BlcnRpZXMgd2hpY2ggYXJlIGRlY29yYXRlZCB3aXRoIHRoZSB7QGxpbmsgcHJvcGVydHl9IGRlY29yYXRvciwgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlXG4gICAgICogaXMgYXV0b21hdGljYWxseSBjcmVhdGVkIGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIHNwZWNpZmllZCBoZXJlLiBGb3QgYXR0cmlidXRlcyB0aGF0IGRvbid0XG4gICAgICogaGF2ZSBhbiBhc3NvY2lhdGVkIHByb3BlcnR5LCByZXR1cm4gdGhlIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGlzIGdldHRlci4gQ2hhbmdlcyB0byB0aGVzZVxuICAgICAqIGF0dHJpYnV0ZXMgY2FuIGJlIGhhbmRsZWQgaW4gdGhlIHtAbGluayBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2t9IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIFdoZW4gZXh0ZW5kaW5nIGNvbXBvbmVudHMsIG1ha2Ugc3VyZSB0byByZXR1cm4gdGhlIHN1cGVyIGNsYXNzJ3Mgb2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICogaWYgeW91IG92ZXJyaWRlIHRoaXMgZ2V0dGVyIChleGNlcHQgaWYgeW91IGRvbid0IHdhbnQgdG8gaW5oZXJpdCBvYnNlcnZlZCBhdHRyaWJ1dGVzKTpcbiAgICAgKlxuICAgICAqIGBgYHR5cGVzY3JpcHRcbiAgICAgKiBAY29tcG9uZW50KHtcbiAgICAgKiAgICAgIHNlbGVjdG9yOiAnbXktZWxlbWVudCdcbiAgICAgKiB9KVxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIE15QmFzZUVsZW1lbnQge1xuICAgICAqXG4gICAgICogICAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuICAgICAqXG4gICAgICogICAgICAgICAgcmV0dXJuIFsuLi5zdXBlci5vYnNlcnZlZEF0dHJpYnV0ZXMsICdteS1hZGRpdGlvbmFsLWF0dHJpYnV0ZSddO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcyAoKTogc3RyaW5nW10ge1xuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVJlcXVlc3Q6IFByb21pc2U8Ym9vbGVhbj4gPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NoYW5nZWRQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RpbmdQcm9wZXJ0aWVzOiBNYXA8UHJvcGVydHlLZXksIGFueT4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeWluZ1Byb3BlcnRpZXM6IE1hcDxQcm9wZXJ0eUtleSwgYW55PiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJEZWNsYXJhdGlvbnM6IEluc3RhbmNlTGlzdGVuZXJEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2hhc1VwZGF0ZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaGFzUmVxdWVzdGVkVXBkYXRlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2lzUmVmbGVjdGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJlbmRlciByb290IGlzIHdoZXJlIHRoZSB7QGxpbmsgcmVuZGVyfSBtZXRob2Qgd2lsbCBhdHRhY2ggaXRzIERPTSBvdXRwdXRcbiAgICAgKi9cbiAgICByZWFkb25seSByZW5kZXJSb290OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAoKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbmRlclJvb3QgPSB0aGlzLl9jcmVhdGVSZW5kZXJSb290KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBtb3ZlZCB0byBhIG5ldyBkb2N1bWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgYWRvcHRlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ2Fkb3B0ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGVhY2ggdGltZSB0aGUgY29tcG9uZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIE4uQi46IFdoZW4gb3ZlcnJpZGluZyB0aGlzIGNhbGxiYWNrLCBtYWtlIHN1cmUgdG8gaW5jbHVkZSBhIHN1cGVyLWNhbGwuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnY29ubmVjdGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBlYWNoIHRpbWUgdGhlIGNvbXBvbmVudCBpcyBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgZG9jdW1lbnQncyBET01cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvV2ViX0NvbXBvbmVudHMvVXNpbmdfY3VzdG9tX2VsZW1lbnRzI1VzaW5nX3RoZV9saWZlY3ljbGVfY2FsbGJhY2tzXG4gICAgICpcbiAgICAgKiBOLkIuOiBXaGVuIG92ZXJyaWRpbmcgdGhpcyBjYWxsYmFjaywgbWFrZSBzdXJlIHRvIGluY2x1ZGUgYSBzdXBlci1jYWxsLlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICB0aGlzLl91bmxpc3RlbigpO1xuXG4gICAgICAgIHRoaXMuX25vdGlmeUxpZmVjeWNsZSgnZGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgdGhpcy5faGFzVXBkYXRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIG9uZSBvZiB0aGUgY29tcG9uZW50J3MgYXR0cmlidXRlcyBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgY2hhbmdlZFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBXaGljaCBhdHRyaWJ1dGVzIHRvIG5vdGljZSBjaGFuZ2UgZm9yIGlzIHNwZWNpZmllZCBpbiB7QGxpbmsgb2JzZXJ2ZWRBdHRyaWJ1dGVzfS5cbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9XZWJfQ29tcG9uZW50cy9Vc2luZ19jdXN0b21fZWxlbWVudHMjVXNpbmdfdGhlX2xpZmVjeWNsZV9jYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEZvciBkZWNvcmF0ZWQgcHJvcGVydGllcyB3aXRoIGFuIGFzc29jaWF0ZWQgYXR0cmlidXRlLCB0aGlzIGlzIGhhbmRsZWQgYXV0b21hdGljYWxseS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIGN1c3RvbWl6ZSB0aGUgaGFuZGxpbmcgb2YgYXR0cmlidXRlIGNoYW5nZXMuIFdoZW4gb3ZlcnJpZGluZ1xuICAgICAqIHRoaXMgbWV0aG9kLCBhIHN1cGVyLWNhbGwgc2hvdWxkIGJlIGluY2x1ZGVkLCB0byBlbnN1cmUgYXR0cmlidXRlIGNoYW5nZXMgZm9yIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICogYXJlIHByb2Nlc3NlZCBjb3JyZWN0bHkuXG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogQGNvbXBvbmVudCh7XG4gICAgICogICAgICBzZWxlY3RvcjogJ215LWVsZW1lbnQnXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgKGF0dHJpYnV0ZTogc3RyaW5nLCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBzdXBlci5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAqXG4gICAgICogICAgICAgICAgLy8gZG8gY3VzdG9tIGhhbmRsaW5nLi4uXG4gICAgICogICAgICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSBUaGUgbmFtZSBvZiB0aGUgY2hhbmdlZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgIFRoZSBvbGQgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyaWJ1dGU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmbGVjdGluZyB8fCBvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlZmxlY3RBdHRyaWJ1dGUoYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgZWFjaCB0aW1lIHRoZSBjb21wb25lbnQgdXBkYXRlc1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgYHVwZGF0ZUNhbGxiYWNrYCBpcyBpbnZva2VkIHN5bmNocm9ub3VzbHkgYnkgdGhlIHtAbGluayB1cGRhdGV9IG1ldGhvZCBhbmQgdGhlcmVmb3JlIGhhcHBlbnMgZGlyZWN0bHkgYWZ0ZXJcbiAgICAgKiByZW5kZXJpbmcsIHByb3BlcnR5IHJlZmxlY3Rpb24gYW5kIHByb3BlcnR5IGNoYW5nZSBldmVudHMuXG4gICAgICpcbiAgICAgKiBOLkIuOiBDaGFuZ2VzIG1hZGUgdG8gcHJvcGVydGllcyBvciBhdHRyaWJ1dGVzIGluc2lkZSB0aGlzIGNhbGxiYWNrICp3b24ndCogY2F1c2UgYW5vdGhlciB1cGRhdGUuXG4gICAgICogVG8gY2F1c2UgYW4gdXBkYXRlLCBkZWZlciBjaGFuZ2VzIHdpdGggdGhlIGhlbHAgb2YgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50J1xuICAgICAqIH0pXG4gICAgICogY2xhc3MgTXlFbGVtZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICAgKlxuICAgICAqICAgICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG4gICAgICpcbiAgICAgKiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgKiAgICAgICAgICAgICAgLy8gcGVyZm9ybSBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gY2F1c2UgYW5vdGhlciB1cGRhdGUgaGVyZVxuICAgICAqICAgICAgICAgIH0pO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjaGFuZ2VzICAgICAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gZmlyc3RVcGRhdGUgICBBIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGlzIHdhcyB0aGUgZmlyc3QgdXBkYXRlXG4gICAgICovXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7IH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSBBbiBldmVudCBuYW1lXG4gICAgICogQHBhcmFtIGV2ZW50SW5pdCBBIHtAbGluayBDdXN0b21FdmVudEluaXR9IGRpY3Rpb25hcnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbm90aWZ5IChldmVudE5hbWU6IHN0cmluZywgZXZlbnRJbml0PzogQ3VzdG9tRXZlbnRJbml0KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIGV2ZW50SW5pdCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoIHByb3BlcnR5IGNoYW5nZXMgb2NjdXJyaW5nIGluIHRoZSBleGVjdXRvciBhbmQgcmFpc2UgY3VzdG9tIGV2ZW50c1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2VzIHNob3VsZCB0cmlnZ2VyIGN1c3RvbSBldmVudHMgd2hlbiB0aGV5IGFyZSBjYXVzZWQgYnkgaW50ZXJuYWwgc3RhdGUgY2hhbmdlcyxcbiAgICAgKiBidXQgbm90IGlmIHRoZXkgYXJlIGNhdXNlZCBieSBhIGNvbnN1bWVyIG9mIHRoZSBjb21wb25lbnQgQVBJIGRpcmVjdGx5LCBlLmcuOlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ215LWN1c3RvbS1lbGVtZW50JykuY3VzdG9tUHJvcGVydHkgPSB0cnVlO1xuICAgICAqIGBgYC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWVhbnMsIHdlIGNhbm5vdCBhdXRvbWF0ZSB0aGlzIHByb2Nlc3MgdGhyb3VnaCBwcm9wZXJ0eSBzZXR0ZXJzLCBhcyB3ZSBjYW4ndCBiZSBzdXJlIHdob1xuICAgICAqIGludm9rZWQgdGhlIHNldHRlciAtIGludGVybmFsIGNhbGxzIG9yIGV4dGVybmFsIGNhbGxzLlxuICAgICAqXG4gICAgICogT25lIG9wdGlvbiBpcyB0byBtYW51YWxseSByYWlzZSB0aGUgZXZlbnQsIHdoaWNoIGNhbiBiZWNvbWUgdGVkaW91cyBhbmQgZm9yY2VzIHVzIHRvIHVzZSBzdHJpbmctXG4gICAgICogYmFzZWQgZXZlbnQgbmFtZXMgb3IgcHJvcGVydHkgbmFtZXMsIHdoaWNoIGFyZSBkaWZmaWN1bHQgdG8gcmVmYWN0b3IsIGUuZy46XG4gICAgICpcbiAgICAgKiBgYGB0eXBlc2NyaXB0XG4gICAgICogdGhpcy5jdXN0b21Qcm9wZXJ0eSA9IHRydWU7XG4gICAgICogLy8gaWYgd2UgcmVmYWN0b3IgdGhlIHByb3BlcnR5IG5hbWUsIHdlIGNhbiBlYXNpbHkgbWlzcyB0aGUgbm90aWZ5IGNhbGxcbiAgICAgKiB0aGlzLm5vdGlmeSgnY3VzdG9tUHJvcGVydHknKTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEEgbW9yZSBjb252ZW5pZW50IHdheSBpcyB0byBleGVjdXRlIHRoZSBpbnRlcm5hbCBjaGFuZ2VzIGluIGEgd3JhcHBlciB3aGljaCBjYW4gZGV0ZWN0IHRoZSBjaGFuZ2VkXG4gICAgICogcHJvcGVydGllcyBhbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHJhaXNlIHRoZSByZXF1aXJlZCBldmVudHMuIFRoaXMgZWxpbWluYXRlcyB0aGUgbmVlZCB0byBtYW51YWxseVxuICAgICAqIHJhaXNlIGV2ZW50cyBhbmQgcmVmYWN0b3JpbmcgZG9lcyBubyBsb25nZXIgYWZmZWN0IHRoZSBwcm9jZXNzLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIHRoaXMud2F0Y2goKCkgPT4ge1xuICAgICAqXG4gICAgICogICAgICB0aGlzLmN1c3RvbVByb3BlcnR5ID0gdHJ1ZTtcbiAgICAgKiAgICAgIC8vIHdlIGNhbiBhZGQgbW9yZSBwcm9wZXJ0eSBtb2RpZmljYXRpb25zIHRvIG5vdGlmeSBpbiBoZXJlXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHBlcmZvcm1zIHRoZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBiZSBub3RpZmllZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3YXRjaCAoZXhlY3V0b3I6ICgpID0+IHZvaWQpIHtcblxuICAgICAgICAvLyBiYWNrIHVwIGN1cnJlbnQgY2hhbmdlZCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNoYW5nZXNcbiAgICAgICAgZXhlY3V0b3IoKTtcblxuICAgICAgICAvLyBhZGQgYWxsIG5ldyBvciB1cGRhdGVkIGNoYW5nZWQgcHJvcGVydGllcyB0byB0aGUgbm90aWZ5aW5nIHByb3BlcnRpZXNcbiAgICAgICAgZm9yIChjb25zdCBbcHJvcGVydHlLZXksIG9sZFZhbHVlXSBvZiB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcykge1xuXG4gICAgICAgICAgICBjb25zdCBhZGRlZCA9ICFwcmV2aW91c0NoYW5nZXMuaGFzKHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSAhYWRkZWQgJiYgdGhpcy5oYXNDaGFuZ2VkKHByb3BlcnR5S2V5LCBwcmV2aW91c0NoYW5nZXMuZ2V0KHByb3BlcnR5S2V5KSwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoYWRkZWQgfHwgdXBkYXRlZCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3QgYW4gdXBkYXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmFsdWUgb2YgYSBkZWNvcmF0ZWQgcHJvcGVydHkgb3IgaXRzIGFzc29jaWF0ZWRcbiAgICAgKiBhdHRyaWJ1dGUgY2hhbmdlcy4gSWYgeW91IG5lZWQgdGhlIGNvbXBvbmVudCB0byB1cGRhdGUgYmFzZWQgb24gYSBzdGF0ZSBjaGFuZ2UgdGhhdCBpc1xuICAgICAqIG5vdCBjb3ZlcmVkIGJ5IGEgZGVjb3JhdGVkIHByb3BlcnR5LCBjYWxsIHRoaXMgbWV0aG9kIHdpdGhvdXQgYW55IGFyZ3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBuYW1lIG9mIHRoZSBjaGFuZ2VkIHByb3BlcnR5IHRoYXQgcmVxdWVzdHMgdGhlIHVwZGF0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICB0aGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgQSBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIHdoZW4gdGhlIHVwZGF0ZSBpcyBjb21wbGV0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVxdWVzdFVwZGF0ZSAocHJvcGVydHlLZXk/OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU/OiBhbnksIG5ld1ZhbHVlPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0ncyBvYnNlcnZlIG9wdGlvbiBpcyBgZmFsc2VgLCB7QGxpbmsgaGFzQ2hhbmdlZH1cbiAgICAgICAgICAgIC8vIHdpbGwgcmV0dXJuIGBmYWxzZWAgYW5kIG5vIHVwZGF0ZSB3aWxsIGJlIHJlcXVlc3RlZFxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0NoYW5nZWQocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSkpIHJldHVybiB0aGlzLl91cGRhdGVSZXF1ZXN0O1xuXG4gICAgICAgICAgICAvLyBzdG9yZSBjaGFuZ2VkIHByb3BlcnR5IGZvciBiYXRjaCBwcm9jZXNzaW5nXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcy5zZXQocHJvcGVydHlLZXksIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIGluIHJlZmxlY3Rpbmcgc3RhdGUsIGFuIGF0dHJpYnV0ZSBpcyByZWZsZWN0aW5nIHRvIHRoaXMgcHJvcGVydHkgYW5kIHdlXG4gICAgICAgICAgICAvLyBjYW4gc2tpcCByZWZsZWN0aW5nIHRoZSBwcm9wZXJ0eSBiYWNrIHRvIHRoZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgIC8vIHByb3BlcnR5IGNoYW5nZXMgbmVlZCB0byBiZSB0cmFja2VkIGhvd2V2ZXIgYW5kIHtAbGluayByZW5kZXJ9IG11c3QgYmUgY2FsbGVkIGFmdGVyXG4gICAgICAgICAgICAvLyB0aGUgYXR0cmlidXRlIGNoYW5nZSBpcyByZWZsZWN0ZWQgdG8gdGhpcyBwcm9wZXJ0eVxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1JlZmxlY3RpbmcpIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzLnNldChwcm9wZXJ0eUtleSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gZW5xdWV1ZSB1cGRhdGUgcmVxdWVzdCBpZiBub25lIHdhcyBlbnF1ZXVlZCBhbHJlYWR5XG4gICAgICAgICAgICB0aGlzLl9lbnF1ZXVlVXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fdXBkYXRlUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSB0byBpdHMge0BsaW5rIHJlbmRlclJvb3R9XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFVzZXMgbGl0LWh0bWwncyB7QGxpbmsgbGl0LWh0bWwjcmVuZGVyfSBtZXRob2QgdG8gcmVuZGVyIGEge0BsaW5rIGxpdC1odG1sI1RlbXBsYXRlUmVzdWx0fSB0byB0aGVcbiAgICAgKiBjb21wb25lbnQncyByZW5kZXIgcm9vdC4gVGhlIGNvbXBvbmVudCBpbnN0YW5jZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgc3RhdGljIHRlbXBsYXRlIG1ldGhvZFxuICAgICAqIGF1dG9tYXRpY2FsbHkuIFRvIG1ha2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGF2YWlsYWJsZSB0byB0aGUgdGVtcGxhdGUgbWV0aG9kLCB5b3UgY2FuIHBhc3MgdGhlbSB0byB0aGVcbiAgICAgKiByZW5kZXIgbWV0aG9kLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGNvbnN0IGRhdGVGb3JtYXR0ZXIgPSAoZGF0ZTogRGF0ZSkgPT4geyAvLyByZXR1cm4gc29tZSBkYXRlIHRyYW5zZm9ybWF0aW9uLi4uXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc2VsZWN0b3I6ICdteS1lbGVtZW50JyxcbiAgICAgKiAgICAgIHRlbXBsYXRlOiAoZWxlbWVudCwgZm9ybWF0RGF0ZSkgPT4gaHRtbGA8c3Bhbj5MYXN0IHVwZGF0ZWQ6ICR7IGZvcm1hdERhdGUoZWxlbWVudC5sYXN0VXBkYXRlZCkgfTwvc3Bhbj5gXG4gICAgICogfSlcbiAgICAgKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAqXG4gICAgICogICAgICBAcHJvcGVydHkoKVxuICAgICAqICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICpcbiAgICAgKiAgICAgIHJlbmRlciAoKSB7XG4gICAgICogICAgICAgICAgLy8gbWFrZSB0aGUgZGF0ZSBmb3JtYXR0ZXIgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBieSBwYXNzaW5nIGl0IHRvIHJlbmRlcigpXG4gICAgICogICAgICAgICAgc3VwZXIucmVuZGVyKGRhdGVGb3JtYXR0ZXIpO1xuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSBoZWxwZXJzICAgQW55IGFkZGl0aW9uYWwgb2JqZWN0cyB3aGljaCBzaG91bGQgYmUgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSBzY29wZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW5kZXIgKC4uLmhlbHBlcnM6IGFueVtdKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSAmJiBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSh0aGlzLCAuLi5oZWxwZXJzKTtcblxuICAgICAgICBpZiAodGVtcGxhdGUpIHJlbmRlcih0ZW1wbGF0ZSwgdGhpcy5yZW5kZXJSb290LCB7IGV2ZW50Q29udGV4dDogdGhpcyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjb21wb25lbnQgYWZ0ZXIgYW4gdXBkYXRlIHdhcyByZXF1ZXN0ZWQgd2l0aCB7QGxpbmsgcmVxdWVzdFVwZGF0ZX1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVuZGVycyB0aGUgdGVtcGxhdGUsIHJlZmxlY3RzIGNoYW5nZWQgcHJvcGVydGllcyB0byBhdHRyaWJ1dGVzIGFuZFxuICAgICAqIGRpc3BhdGNoZXMgY2hhbmdlIGV2ZW50cyBmb3IgcHJvcGVydGllcyB3aGljaCBhcmUgbWFya2VkIGZvciBub3RpZmljYXRpb24uXG4gICAgICogVG8gaGFuZGxlIHVwZGF0ZXMgZGlmZmVyZW50bHksIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGFuZCBhIG1hcCBvZiBwcm9wZXJ0eVxuICAgICAqIGNoYW5nZXMgaXMgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyAgIEEgbWFwIG9mIHByb3BlcnRpZXMgdGhhdCBjaGFuZ2VkIGluIHRoZSB1cGRhdGUsIGNvbnRhaW5nIHRoZSBwcm9wZXJ0eSBrZXkgYW5kIHRoZSBvbGQgdmFsdWVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlIChjaGFuZ2VzPzogQ2hhbmdlcykge1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gcmVmbGVjdCBhbGwgcHJvcGVydGllcyBtYXJrZWQgZm9yIHJlZmxlY3Rpb25cbiAgICAgICAgdGhpcy5fcmVmbGVjdGluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWU6IGFueSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMucmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgdGhpc1twcm9wZXJ0eUtleSBhcyBrZXlvZiBDb21wb25lbnRdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbm90aWZ5IGFsbCBwcm9wZXJ0aWVzIG1hcmtlZCBmb3Igbm90aWZpY2F0aW9uXG4gICAgICAgIHRoaXMuX25vdGlmeWluZ1Byb3BlcnRpZXMuZm9yRWFjaCgob2xkVmFsdWUsIHByb3BlcnR5S2V5KSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMubm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIENvbXBvbmVudF0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHByb3BlcnR5IGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgcmVzb2x2ZXMgdGhlIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfSBmb3IgdGhlIHByb3BlcnR5IGFuZCByZXR1cm5zIGl0cyByZXN1bHQuXG4gICAgICogSWYgbm9uZSBpcyBkZWZpbmVkICh0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24ncyBgb2JzZXJ2ZWAgb3B0aW9uIGlzIGBmYWxzZWApIGl0IHJldHVybnMgZmFsc2UuXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eUNoYW5nZURldGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICogQHJldHVybnMgICAgICAgICAgICAgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBjaGFuZ2VkLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNDaGFuZ2VkIChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBwcm9wZXJ0eURlY2xhcmF0aW9uID0gdGhpcy5nZXRQcm9wZXJ0eURlY2xhcmF0aW9uKHByb3BlcnR5S2V5KTtcblxuICAgICAgICAvLyBvYnNlcnZlIGlzIGVpdGhlciBgZmFsc2VgIG9yIGEge0BsaW5rIFByb3BlcnR5Q2hhbmdlRGV0ZWN0b3J9XG4gICAgICAgIGlmIChwcm9wZXJ0eURlY2xhcmF0aW9uICYmIGlzUHJvcGVydHlDaGFuZ2VEZXRlY3Rvcihwcm9wZXJ0eURlY2xhcmF0aW9uLm9ic2VydmUpKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5RGVjbGFyYXRpb24ub2JzZXJ2ZS5jYWxsKG51bGwsIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBDSEFOR0VfREVURUNUT1JfRVJST1IocHJvcGVydHlEZWNsYXJhdGlvbi5vYnNlcnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gZm9yIGEgZGVjb3JhdGVkIHByb3BlcnR5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgVGhlIHByb3BlcnR5IGtleSBmb3Igd2hpY2ggdG8gcmV0cmlldmUgdGhlIGRlY2xhcmF0aW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFByb3BlcnR5RGVjbGFyYXRpb24gKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSk6IFByb3BlcnR5RGVjbGFyYXRpb24gfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiAodGhpcy5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgQ29tcG9uZW50KS5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVmbGVjdCBhbiBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIGFzc29jaWF0ZWQgcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RBdHRyaWJ1dGV9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBBdHRyaWJ1dGVSZWZsZWN0b3J9cyBhbmQgdGhyb3dzIGEgbW9yZSBoZWxwZnVsIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lIFRoZSBwcm9wZXJ0IGtleSBvZiB0aGUgcHJvcGVydHkgdG8gcmVmbGVjdFxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSAgICAgIFRoZSBvbGQgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgICAgICBUaGUgbmV3IHByb3BlcnR5IHZhbHVlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKTtcblxuICAgICAgICAvLyBpZ25vcmUgdXNlci1kZWZpbmVkIG9ic2VydmVkIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gVE9ETzogdGVzdCB0aGlzIGFuZCByZW1vdmUgdGhlIGxvZ1xuICAgICAgICBpZiAoIXByb3BlcnR5S2V5KSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBvYnNlcnZlZCBhdHRyaWJ1dGUgXCIkeyBhdHRyaWJ1dGVOYW1lIH1cIiBub3QgZm91bmQuLi4gaWdub3JpbmcuLi5gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZX0gaXMgZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkge1xuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNBdHRyaWJ1dGVSZWZsZWN0b3IocHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlKSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0QXR0cmlidXRlLmNhbGwodGhpcywgYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgQVRUUklCVVRFX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZV0gYXMgQXR0cmlidXRlUmVmbGVjdG9yKShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBBVFRSSUJVVEVfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdEF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZmxlY3QgYSBwcm9wZXJ0eSB2YWx1ZSB0byBpdHMgYXNzb2NpYXRlZCBhdHRyaWJ1dGVcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhpcyBtZXRob2QgY2hlY2tzLCBpZiBhbnkgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn0gaGFzIGJlZW4gZGVmaW5lZCBmb3IgdGhlXG4gICAgICogcHJvcGVydHkgYW5kIGludm9rZXMgdGhlIGFwcHJvcHJpYXRlIHJlZmxlY3Rvci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIHJlZmxlY3RvciB7QGxpbmsgX3JlZmxlY3RQcm9wZXJ0eX0uXG4gICAgICpcbiAgICAgKiBJdCBjYXRjaGVzIGFueSBlcnJvciBpbiBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfXMgYW5kIHRocm93cyBhIG1vcmUgaGVscGZ1bCBvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydCBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpO1xuXG4gICAgICAgIC8vIGRvbid0IHJlZmxlY3QgaWYge0BsaW5rIHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5fSBpcyBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydHlEZWNsYXJhdGlvbiAmJiBwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICAvLyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHdlIGNhbiBjYXRjaCB0aGUgc3RhdGUgdGhlcmVcbiAgICAgICAgICAgIHRoaXMuX2lzUmVmbGVjdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5UmVmbGVjdG9yKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlEZWNsYXJhdGlvbi5yZWZsZWN0UHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgUFJPUEVSVFlfUkVGTEVDVE9SX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQcm9wZXJ0eUtleShwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICh0aGlzW3Byb3BlcnR5RGVjbGFyYXRpb24ucmVmbGVjdFByb3BlcnR5XSBhcyBQcm9wZXJ0eVJlZmxlY3RvcikocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX1JFRkxFQ1RPUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLnJlZmxlY3RQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVmbGVjdFByb3BlcnR5KHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9pc1JlZmxlY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJhaXNlIGFuIGV2ZW50IGZvciBhIHByb3BlcnR5IGNoYW5nZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIG1ldGhvZCBjaGVja3MsIGlmIGFueSBjdXN0b20ge0BsaW5rIFByb3BlcnR5Tm90aWZpZXJ9IGhhcyBiZWVuIGRlZmluZWQgZm9yIHRoZVxuICAgICAqIHByb3BlcnR5IGFuZCBpbnZva2VzIHRoZSBhcHByb3ByaWF0ZSBub3RpZmllci4gSWYgbm90LCBpdCB3aWxsIHVzZSB0aGUgZGVmYXVsdFxuICAgICAqIG5vdGlmaWVyIHtAbGluayBfbm90aWZ5UHJvcGVydHl9LlxuICAgICAqXG4gICAgICogSXQgY2F0Y2hlcyBhbnkgZXJyb3IgaW4gY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1zIGFuZCB0aHJvd3MgYSBtb3JlIGhlbHBmdWwgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5ICAgVGhlIHByb3BlcnQga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byByYWlzZSBhbiBldmVudCBmb3JcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlQcm9wZXJ0eSAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSk7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5RGVjbGFyYXRpb24gJiYgcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnkpIHtcblxuICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlOb3RpZmllcihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSkpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LmNhbGwodGhpcywgcHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFBST1BFUlRZX05PVElGSUVSX0VSUk9SKHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1Byb3BlcnR5S2V5KHByb3BlcnR5RGVjbGFyYXRpb24ubm90aWZ5KSkge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXNbcHJvcGVydHlEZWNsYXJhdGlvbi5ub3RpZnldIGFzIFByb3BlcnR5Tm90aWZpZXIpKHByb3BlcnR5S2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBQUk9QRVJUWV9OT1RJRklFUl9FUlJPUihwcm9wZXJ0eURlY2xhcmF0aW9uLm5vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5UHJvcGVydHkocHJvcGVydHlLZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBjb21wb25lbnQncyByZW5kZXIgcm9vdFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgcmVuZGVyIHJvb3QgaXMgd2hlcmUgdGhlIHtAbGluayByZW5kZXJ9IG1ldGhvZCB3aWxsIGF0dGFjaCBpdHMgRE9NIG91dHB1dC4gV2hlbiB1c2luZyB0aGUgY29tcG9uZW50XG4gICAgICogd2l0aCBzaGFkb3cgbW9kZSwgaXQgd2lsbCBiZSBhIHtAbGluayBTaGFkb3dSb290fSwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZVJlbmRlclJvb3QgKCk6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50IHtcblxuICAgICAgICByZXR1cm4gKHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudCkuc2hhZG93XG4gICAgICAgICAgICA/IHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pXG4gICAgICAgICAgICA6IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgY29tcG9uZW50J3Mgc3R5bGVzIHRvIGl0cyB7QGxpbmsgcmVuZGVyUm9vdH1cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgY29uc3RydWN0YWJsZSBzdHlsZXNoZWV0cyBhcmUgYXZhaWxhYmxlLCB0aGUgY29tcG9uZW50J3Mge0BsaW5rIENTU1N0eWxlU2hlZXR9IGluc3RhbmNlIHdpbGwgYmUgYWRvcHRlZFxuICAgICAqIGJ5IHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIG5vdCwgYSBzdHlsZSBlbGVtZW50IGlzIGNyZWF0ZWQgYW5kIGF0dGFjaGVkIHRvIHRoZSB7QGxpbmsgU2hhZG93Um9vdH0uIElmIHRoZVxuICAgICAqIGNvbXBvbmVudCBpcyBub3QgdXNpbmcgc2hhZG93IG1vZGUsIGEgc2NyaXB0IHRhZyB3aWxsIGJlIGFwcGVuZGVkIHRvIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLiBGb3IgbXVsdGlwbGVcbiAgICAgKiBpbnN0YW5jZXMgb2YgdGhlIHNhbWUgY29tcG9uZW50IG9ubHkgb25lIHN0eWxlc2hlZXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2Fkb3B0U3R5bGVzICgpIHtcblxuICAgICAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIENvbXBvbmVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVTaGVldCA9IGNvbnN0cnVjdG9yLnN0eWxlU2hlZXQ7XG4gICAgICAgIGNvbnN0IHN0eWxlRWxlbWVudCA9IGNvbnN0cnVjdG9yLnN0eWxlRWxlbWVudDtcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gY29uc3RydWN0b3Iuc3R5bGVzO1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3QgdGhpcyBwYXJ0IG9uY2Ugd2UgaGF2ZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIChDaHJvbWUgNzMpXG4gICAgICAgICAgICBpZiAoIWNvbnN0cnVjdG9yLnNoYWRvdykge1xuXG4gICAgICAgICAgICAgICAgaWYgKChkb2N1bWVudCBhcyBEb2N1bWVudE9yU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzLmluY2x1ZGVzKHN0eWxlU2hlZXQpKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQgYXMgRG9jdW1lbnRPclNoYWRvd1Jvb3QpLmFkb3B0ZWRTdHlsZVNoZWV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRvY3VtZW50IGFzIERvY3VtZW50T3JTaGFkb3dSb290KS5hZG9wdGVkU3R5bGVTaGVldHMsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIHdvcmsgb25jZSBjb25zdHJ1Y3RhYmxlIHN0eWxlc2hlZXRzIGFycml2ZVxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd2ljZy5naXRodWIuaW8vY29uc3RydWN0LXN0eWxlc2hlZXRzL1xuICAgICAgICAgICAgICAgICh0aGlzLnJlbmRlclJvb3QgYXMgU2hhZG93Um9vdCkuYWRvcHRlZFN0eWxlU2hlZXRzID0gW3N0eWxlU2hlZXRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoc3R5bGVFbGVtZW50KSB7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHRlc3Qgd2UgZG9uJ3QgZHVwbGljYXRlIHN0eWxlc2hlZXRzIGZvciBub24tc2hhZG93IGVsZW1lbnRzXG4gICAgICAgICAgICBjb25zdCBzdHlsZUFscmVhZHlBZGRlZCA9IGNvbnN0cnVjdG9yLnNoYWRvd1xuICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICA6IEFycmF5LmZyb20oZG9jdW1lbnQuc3R5bGVTaGVldHMpLmZpbmQoc3R5bGUgPT4gc3R5bGUudGl0bGUgPT09IGNvbnN0cnVjdG9yLnNlbGVjdG9yKSAmJiB0cnVlIHx8IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGVBbHJlYWR5QWRkZWQpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gY2xvbmUgdGhlIGNhY2hlZCBzdHlsZSBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChjb25zdHJ1Y3Rvci5zaGFkb3cpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vdC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBkZWZhdWx0IGF0dHJpYnV0ZSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIEF0dHJpYnV0ZVJlZmxlY3Rvcn0gaXMgZGVmaW5lZCBpbiB0aGUge0BsaW5rIFByb3BlcnR5RGVjbGFyYXRpb259IHRoaXNcbiAgICAgKiBtZXRob2QgaXMgdXNlZCB0byByZWZsZWN0IHRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gaXRzIGFzc29jaWF0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlTmFtZSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSAgICAgIFRoZSBuZXcgYXR0cmlidXRlIHZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3JlZmxlY3RBdHRyaWJ1dGUgKGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZyB8IG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcgfCBudWxsKSB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXkgPSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzLmdldChhdHRyaWJ1dGVOYW1lKSE7XG5cbiAgICAgICAgY29uc3QgcHJvcGVydHlEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0UHJvcGVydHlEZWNsYXJhdGlvbihwcm9wZXJ0eUtleSkhO1xuXG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eURlY2xhcmF0aW9uLmNvbnZlcnRlci5mcm9tQXR0cmlidXRlKG5ld1ZhbHVlKTtcblxuICAgICAgICB0aGlzW3Byb3BlcnR5S2V5IGFzIGtleW9mIHRoaXNdID0gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZGVmYXVsdCBwcm9wZXJ0eSByZWZsZWN0b3JcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogSWYgbm8ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSBpcyBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gdGhpc1xuICAgICAqIG1ldGhvZCBpcyB1c2VkIHRvIHJlZmxlY3QgdGhlIHByb3BlcnR5IHZhbHVlIHRvIGl0cyBhc3NvY2lhdGVkIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAgIFRoZSBwcm9wZXJ0eSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIHJlZmxlY3RcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgICAgICBUaGUgb2xkIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlICAgICAgVGhlIG5ldyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZWZsZWN0UHJvcGVydHkgKHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSwgb2xkVmFsdWU6IGFueSwgbmV3VmFsdWU6IGFueSkge1xuXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgZm9yIHByb3BlcnRpZXMgd2hpY2ggaGF2ZSBhIGRlY2xhcmF0aW9uXG4gICAgICAgIGNvbnN0IHByb3BlcnR5RGVjbGFyYXRpb24gPSB0aGlzLmdldFByb3BlcnR5RGVjbGFyYXRpb24ocHJvcGVydHlLZXkpITtcblxuICAgICAgICAvLyBpZiB0aGUgZGVmYXVsdCByZWZsZWN0b3IgaXMgdXNlZCwgd2UgbmVlZCB0byBjaGVjayBpZiBhbiBhdHRyaWJ1dGUgZm9yIHRoaXMgcHJvcGVydHkgZXhpc3RzXG4gICAgICAgIC8vIGlmIG5vdCwgd2Ugd29uJ3QgcmVmbGVjdFxuICAgICAgICBpZiAoIXByb3BlcnR5RGVjbGFyYXRpb24uYXR0cmlidXRlKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWYgYXR0cmlidXRlIGlzIHRydXRoeSwgaXQncyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlEZWNsYXJhdGlvbi5hdHRyaWJ1dGUgYXMgc3RyaW5nO1xuXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIGF0dHJpYnV0ZSB2YWx1ZVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IHByb3BlcnR5RGVjbGFyYXRpb24uY29udmVydGVyLnRvQXR0cmlidXRlKG5ld1ZhbHVlKTtcblxuICAgICAgICAvLyB1bmRlZmluZWQgbWVhbnMgZG9uJ3QgY2hhbmdlXG4gICAgICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBudWxsIG1lYW5zIHJlbW92ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGVsc2UgaWYgKGF0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIGEgcHJvcGVydHktY2hhbmdlZCBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIHByb3BlcnR5S2V5XG4gICAgICogQHBhcmFtIG9sZFZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeVByb3BlcnR5IChwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBldmVudE5hbWUgPSBjcmVhdGVFdmVudE5hbWUocHJvcGVydHlLZXksICcnLCAnY2hhbmdlZCcpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY29tcG9zZWQ6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IHByb3BlcnR5S2V5LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBuZXdWYWx1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaCBhIGxpZmVjeWNsZSBldmVudFxuICAgICAqXG4gICAgICogQHBhcmFtIGxpZmVjeWNsZSBUaGUgbGlmZWN5Y2xlIGZvciB3aGljaCB0byByYWlzZSB0aGUgZXZlbnQgKHdpbGwgYmUgdGhlIGV2ZW50IG5hbWUpXG4gICAgICogQHBhcmFtIGRldGFpbCAgICBPcHRpb25hbCBldmVudCBkZXRhaWxzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX25vdGlmeUxpZmVjeWNsZSAobGlmZWN5Y2xlOiAnYWRvcHRlZCcgfCAnY29ubmVjdGVkJyB8ICdkaXNjb25uZWN0ZWQnIHwgJ3VwZGF0ZScsIGRldGFpbD86IG9iamVjdCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobGlmZWN5Y2xlLCB7XG4gICAgICAgICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgICAgICAgIC4uLihkZXRhaWwgPyB7IGRldGFpbDogZGV0YWlsIH0gOiB7fSlcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgY29tcG9uZW50IGxpc3RlbmVyc1xuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9saXN0ZW4gKCkge1xuXG4gICAgICAgICh0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQpLmxpc3RlbmVycy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgbGlzdGVuZXIpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEZWNsYXJhdGlvbjogSW5zdGFuY2VMaXN0ZW5lckRlY2xhcmF0aW9uID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gY29weSB0aGUgY2xhc3MncyBzdGF0aWMgbGlzdGVuZXIgZGVjbGFyYXRpb24gaW50byBhbiBpbnN0YW5jZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIGV2ZW50OiBkZWNsYXJhdGlvbi5ldmVudCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBkZWNsYXJhdGlvbi5vcHRpb25zLFxuXG4gICAgICAgICAgICAgICAgLy8gYmluZCB0aGUgY29tcG9uZW50cyBsaXN0ZW5lciBtZXRob2QgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGluc3RhbmNlIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgbGlzdGVuZXI6ICh0aGlzW2xpc3RlbmVyIGFzIGtleW9mIHRoaXNdIGFzIHVua25vd24gYXMgRXZlbnRMaXN0ZW5lcikuYmluZCh0aGlzKSxcblxuICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgZXZlbnQgdGFyZ2V0IGFuZCBzdG9yZSBpdCBpbiB0aGUgaW5zdGFuY2UgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICB0YXJnZXQ6IChkZWNsYXJhdGlvbi50YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgID8gKHR5cGVvZiBkZWNsYXJhdGlvbi50YXJnZXQgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGRlY2xhcmF0aW9uLnRhcmdldC5jYWxsKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2xhcmF0aW9uLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICA6IHRoaXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgYm91bmQgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHRhcmdldFxuICAgICAgICAgICAgaW5zdGFuY2VEZWNsYXJhdGlvbi50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmV2ZW50IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZURlY2xhcmF0aW9uLmxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGVjbGFyYXRpb24ub3B0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIGluc3RhbmNlIGxpc3RlbmVyIGRlY2xhcmF0aW9uIGluIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyRGVjbGFyYXRpb25zLnB1c2goaW5zdGFuY2VEZWNsYXJhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjb21wb25lbnQgbGlzdGVuZXJzXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3VubGlzdGVuICgpIHtcblxuICAgICAgICB0aGlzLl9saXN0ZW5lckRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsYXJhdGlvbikgPT4ge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICBkZWNsYXJhdGlvbi5ldmVudCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ubGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgZGVjbGFyYXRpb24ub3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVucXVldWUgYSByZXF1ZXN0IGZvciBhbiBhc3luY2hyb25vdXMgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgX2VucXVldWVVcGRhdGUgKCkge1xuXG4gICAgICAgIGxldCByZXNvbHZlOiAocmVzdWx0OiBib29sZWFuKSA9PiB2b2lkO1xuXG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVxdWVzdCA9IHRoaXMuX3VwZGF0ZVJlcXVlc3Q7XG5cbiAgICAgICAgLy8gbWFyayB0aGUgY29tcG9uZW50IGFzIGhhdmluZyByZXF1ZXN0ZWQgYW4gdXBkYXRlLCB0aGUge0BsaW5rIF9yZXF1ZXN0VXBkYXRlfVxuICAgICAgICAvLyBtZXRob2Qgd2lsbCBub3QgZW5xdWV1ZSBhIGZ1cnRoZXIgcmVxdWVzdCBmb3IgdXBkYXRlIGlmIG9uZSBpcyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy5faGFzUmVxdWVzdGVkVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl91cGRhdGVSZXF1ZXN0ID0gbmV3IFByb21pc2U8Ym9vbGVhbj4ocmVzID0+IHJlc29sdmUgPSByZXMpO1xuXG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSBwcmV2aW91cyB1cGRhdGUgdG8gcmVzb2x2ZVxuICAgICAgICAvLyBgYXdhaXRgIGlzIGFzeW5jaHJvbm91cyBhbmQgd2lsbCByZXR1cm4gZXhlY3V0aW9uIHRvIHRoZSB7QGxpbmsgcmVxdWVzdFVwZGF0ZX0gbWV0aG9kXG4gICAgICAgIC8vIGFuZCBlc3NlbnRpYWxseSBhbGxvd3MgdXMgdG8gYmF0Y2ggbXVsdGlwbGUgc3luY2hyb25vdXMgcHJvcGVydHkgY2hhbmdlcywgYmVmb3JlIHRoZVxuICAgICAgICAvLyBleGVjdXRpb24gY2FuIHJlc3VtZSBoZXJlXG4gICAgICAgIGF3YWl0IHByZXZpb3VzUmVxdWVzdDtcblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zY2hlZHVsZVVwZGF0ZSgpO1xuXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgdXBkYXRlIG1heSBiZSBzY2hlZHVsZWQgYXN5bmNocm9ub3VzbHkgYXMgd2VsbFxuICAgICAgICBpZiAocmVzdWx0KSBhd2FpdCByZXN1bHQ7XG5cbiAgICAgICAgLy8gcmVzb2x2ZSB0aGUgbmV3IHtAbGluayBfdXBkYXRlUmVxdWVzdH0gYWZ0ZXIgdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCB1cGRhdGUgcmVzb2x2ZXNcbiAgICAgICAgcmVzb2x2ZSEoIXRoaXMuX2hhc1JlcXVlc3RlZFVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NoZWR1bGUgdGhlIHVwZGF0ZSBvZiB0aGUgY29tcG9uZW50XG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNjaGVkdWxlcyB0aGUgZmlyc3QgdXBkYXRlIG9mIHRoZSBjb21wb25lbnQgYXMgc29vbiBhcyBwb3NzaWJsZSBhbmQgYWxsIGNvbnNlY3V0aXZlIHVwZGF0ZXNcbiAgICAgKiBqdXN0IGJlZm9yZSB0aGUgbmV4dCBmcmFtZS4gSW4gdGhlIGxhdHRlciBjYXNlIGl0IHJldHVybnMgYSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgYWZ0ZXJcbiAgICAgKiB0aGUgdXBkYXRlIGlzIGRvbmUuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NjaGVkdWxlVXBkYXRlICgpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUoKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzY2hlZHVsZSB0aGUgdXBkYXRlIHZpYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgdG8gYXZvaWQgbXVsdGlwbGUgcmVkcmF3cyBwZXIgZnJhbWVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlKCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHRoZSBjb21wb25lbnQgdXBkYXRlXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIEludm9rZXMge0BsaW5rIHVwZGF0ZUNhbGxiYWNrfSBhZnRlciBwZXJmb3JtaW5nIHRoZSB1cGRhdGUgYW5kIGNsZWFucyB1cCB0aGUgY29tcG9uZW50XG4gICAgICogc3RhdGUuIER1cmluZyB0aGUgZmlyc3QgdXBkYXRlIHRoZSBlbGVtZW50J3Mgc3R5bGVzIHdpbGwgYmUgYWRkZWQuIERpc3BhdGNoZXMgdGhlIHVwZGF0ZVxuICAgICAqIGxpZmVjeWNsZSBldmVudC5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcGVyZm9ybVVwZGF0ZSAoKSB7XG5cbiAgICAgICAgLy8gd2UgaGF2ZSB0byB3YWl0IHVudGlsIHRoZSBjb21wb25lbnQgaXMgY29ubmVjdGVkIGJlZm9yZSB3ZSBjYW4gZG8gYW55IHVwZGF0ZXNcbiAgICAgICAgLy8gdGhlIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gd2lsbCBjYWxsIHtAbGluayByZXF1ZXN0VXBkYXRlfSBpbiBhbnkgY2FzZSwgc28gd2UgY2FuXG4gICAgICAgIC8vIHNpbXBseSBieXBhc3MgYW55IGFjdHVhbCB1cGRhdGUgYW5kIGNsZWFuLXVwIHVudGlsIHRoZW5cbiAgICAgICAgaWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgY29uc3QgY2hhbmdlcyA9IG5ldyBNYXAodGhpcy5fY2hhbmdlZFByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICAvLyBwYXNzIGEgY29weSBvZiB0aGUgcHJvcGVydHkgY2hhbmdlcyB0byB0aGUgdXBkYXRlIG1ldGhvZCwgc28gcHJvcGVydHkgY2hhbmdlc1xuICAgICAgICAgICAgLy8gYXJlIGF2YWlsYWJsZSBpbiBhbiBvdmVycmlkZGVuIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGNoYW5nZXMpO1xuXG4gICAgICAgICAgICAvLyByZXNldCBwcm9wZXJ0eSBtYXBzIGRpcmVjdGx5IGFmdGVyIHRoZSB1cGRhdGUsIHNvIGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGVDYWxsYmFja1xuICAgICAgICAgICAgLy8gY2FuIGJlIHJlY29yZGVkIGZvciB0aGUgbmV4dCB1cGRhdGUsIHdoaWNoIGhhcyB0byBiZSB0cmlnZ2VyZWQgbWFudWFsbHkgdGhvdWdoXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3RpbmdQcm9wZXJ0aWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5fbm90aWZ5aW5nUHJvcGVydGllcyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSB3ZSBhZG9wdCB0aGUgZWxlbWVudCdzIHN0eWxlcyBhbmQgc2V0IHVwIGRlY2xhcmVkIGxpc3RlbmVyc1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9oYXNVcGRhdGVkKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9hZG9wdFN0eWxlcygpO1xuXG4gICAgICAgICAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnMgYWZ0ZXIgdGhlIHVwZGF0ZSwgdGhpcyB3YXkgd2UgZW5zdXJlIGFsbCBET00gaXMgcmVuZGVyZWQsIGFsbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgLy8gYXJlIHVwLXRvLWRhdGUgYW5kIGFueSB1c2VyLWNyZWF0ZWQgb2JqZWN0cyAoZS5nLiB3b3JrZXJzKSB3aWxsIGJlIGNyZWF0ZWQgaW4gYW5cbiAgICAgICAgICAgICAgICAvLyBvdmVycmlkZGVuIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlzdGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsbGJhY2soY2hhbmdlcywgIXRoaXMuX2hhc1VwZGF0ZWQpO1xuXG4gICAgICAgICAgICB0aGlzLl9ub3RpZnlMaWZlY3ljbGUoJ3VwZGF0ZScsIHsgY2hhbmdlczogY2hhbmdlcywgZmlyc3RVcGRhdGU6ICF0aGlzLl9oYXNVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICB0aGlzLl9oYXNVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hcmsgY29tcG9uZW50IGFzIHVwZGF0ZWQgKmFmdGVyKiB0aGUgdXBkYXRlIHRvIHByZXZlbnQgaW5maW50ZSBsb29wcyBpbiB0aGUgdXBkYXRlIHByb2Nlc3NcbiAgICAgICAgLy8gTi5CLjogYW55IHByb3BlcnR5IGNoYW5nZXMgZHVyaW5nIHRoZSB1cGRhdGUgd2lsbCBub3QgdHJpZ2dlciBhbm90aGVyIHVwZGF0ZVxuICAgICAgICB0aGlzLl9oYXNSZXF1ZXN0ZWRVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5cbi8qKlxuICogQSB7QGxpbmsgQ29tcG9uZW50fSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudERlY2xhcmF0aW9uPFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgc2VsZWN0b3Igb2YgdGhlIGNvbXBvbmVudFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgc2VsZWN0b3Igd2lsbCBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3Igd2l0aCB0aGUgYnJvd3NlcidzXG4gICAgICoge0BsaW5rIHdpbmRvdy5jdXN0b21FbGVtZW50c30gQVBJLiBJZiBubyBzZWxlY3RvciBpcyBzcGVjaWZpZWQsIHRoZSBjb21wb25lbnQgY2xhc3NcbiAgICAgKiBuZWVkcyB0byBwcm92aWRlIG9uZSBpbiBpdHMgc3RhdGljIHtAbGluayBDb21wb25lbnQuc2VsZWN0b3J9IHByb3BlcnR5LlxuICAgICAqIEEgc2VsZWN0b3IgZGVmaW5lZCBpbiB0aGUge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufSB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoZVxuICAgICAqIHN0YXRpYyBjbGFzcyBwcm9wZXJ0eS5cbiAgICAgKi9cbiAgICBzZWxlY3Rvcjogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFVzZSBTaGFkb3cgRE9NIHRvIHJlbmRlciB0aGUgY29tcG9uZW50cyB0ZW1wbGF0ZT9cbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogU2hhZG93IERPTSBjYW4gYmUgZGlzYWJsZWQgYnkgc2V0dGluZyB0aGlzIG9wdGlvbiB0byBgZmFsc2VgLCBpbiB3aGljaCBjYXNlIHRoZVxuICAgICAqIGNvbXBvbmVudCdzIHRlbXBsYXRlIHdpbGwgYmUgcmVuZGVyZWQgYXMgY2hpbGQgbm9kZXMgb2YgdGhlIGNvbXBvbmVudC4gVGhpcyBjYW4gYmVcbiAgICAgKiB1c2VmdWwgaWYgYW4gaXNvbGF0ZWQgRE9NIGFuZCBzY29wZWQgQ1NTIGlzIG5vdCBkZXNpcmVkLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgc2hhZG93OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIEF1dG9tYXRpY2FsbHkgcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBicm93c2VyJ3Mge0BsaW5rIHdpbmRvdy5jdXN0b21FbGVtZW50c30gQVBJP1xuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBJbiBjYXNlcyB3aGVyZSB5b3Ugd2FudCB0byBlbXBsb3kgYSBtb2R1bGUgc3lzdGVtIHdoaWNoIHJlZ2lzdGVycyBjb21wb25lbnRzIG9uIGFcbiAgICAgKiBjb25kaXRpb25hbCBiYXNpcywgeW91IGNhbiBkaXNhYmxlIGF1dG9tYXRpYyByZWdpc3RyYXRpb24gYnkgc2V0dGluZyB0aGlzIG9wdGlvbiB0byBgZmFsc2VgLlxuICAgICAqIFlvdXIgbW9kdWxlIG9yIGJvb3RzdHJhcCBzeXN0ZW0gd2lsbCBoYXZlIHRvIHRha2UgY2FyZSBvZiBkZWZpbmluZyB0aGUgY29tcG9uZW50IGxhdGVyLlxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHRydWVgXG4gICAgICovXG4gICAgZGVmaW5lOiBib29sZWFuO1xuICAgIC8vIFRPRE86IHRlc3QgbWVkaWEgcXVlcmllc1xuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyBzdHlsZXNcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogQW4gYXJyYXkgb2YgQ1NTIHJ1bGVzZXRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvU3ludGF4I0NTU19ydWxlc2V0cykuXG4gICAgICogU3R5bGVzIGRlZmluZWQgdXNpbmcgdGhlIGRlY29yYXRvciB3aWxsIGJlIG1lcmdlZCB3aXRoIHN0eWxlcyBkZWZpbmVkIGluIHRoZSBjb21wb25lbnQnc1xuICAgICAqIHN0YXRpYyB7QGxpbmsgQ29tcG9uZW50LnN0eWxlc30gZ2V0dGVyLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIEBjb21wb25lbnQoe1xuICAgICAqICAgICAgc3R5bGVzOiBbXG4gICAgICogICAgICAgICAgJ2gxLCBoMiB7IGZvbnQtc2l6ZTogMTZwdDsgfScsXG4gICAgICogICAgICAgICAgJ0BtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDkwMHB4KSB7IGFydGljbGUgeyBwYWRkaW5nOiAxcmVtIDNyZW07IH0gfSdcbiAgICAgKiAgICAgIF1cbiAgICAgKiB9KVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogRGVmYXVsdCB2YWx1ZTogYHVuZGVmaW5lZGBcbiAgICAgKi9cbiAgICBzdHlsZXM/OiBzdHJpbmdbXTtcbiAgICAvLyBUT0RPOiB1cGRhdGUgZG9jdW1lbnRhdGlvblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBBIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB7QGxpbmsgI2xpdC1odG1sLlRlbXBsYXRlUmVzdWx0fS4gVGhlIGZ1bmN0aW9uJ3MgYGVsZW1lbnRgXG4gICAgICogcGFyYW1ldGVyIHdpbGwgYmUgdGhlIGN1cnJlbnQgY29tcG9uZW50IGluc3RhbmNlLiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCBieSB0aGVcbiAgICAgKiBjb21wb25lbnQncyByZW5kZXIgbWV0aG9kLlxuICAgICAqXG4gICAgICogVGhlIG1ldGhvZCBtdXN0IHJldHVybiBhIHtAbGluayBsaXQtaHRtbCNUZW1wbGF0ZVJlc3VsdH0gd2hpY2ggaXMgY3JlYXRlZCB1c2luZyBsaXQtaHRtbCdzXG4gICAgICoge0BsaW5rIGxpdC1odG1sI2h0bWwgfCBgaHRtbGB9IG9yIHtAbGluayBsaXQtaHRtbCNzdmcgfCBgc3ZnYH0gdGVtcGxhdGUgbWV0aG9kcy5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgdmFsdWU6IGB1bmRlZmluZWRgXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgY29tcG9uZW50IGluc3RhbmNlIHJlcXVlc3RpbmcgdGhlIHRlbXBsYXRlXG4gICAgICovXG4gICAgdGVtcGxhdGU/OiAoZWxlbWVudDogVHlwZSwgLi4uaGVscGVyczogYW55W10pID0+IFRlbXBsYXRlUmVzdWx0IHwgdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgQ29tcG9uZW50RGVjbGFyYXRpb259XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTjogQ29tcG9uZW50RGVjbGFyYXRpb24gPSB7XG4gICAgc2VsZWN0b3I6ICcnLFxuICAgIHNoYWRvdzogdHJ1ZSxcbiAgICBkZWZpbmU6IHRydWUsXG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IENvbXBvbmVudERlY2xhcmF0aW9uLCBERUZBVUxUX0NPTVBPTkVOVF9ERUNMQVJBVElPTiB9IGZyb20gJy4vY29tcG9uZW50LWRlY2xhcmF0aW9uJztcbmltcG9ydCB7IERlY29yYXRlZENvbXBvbmVudFR5cGUgfSBmcm9tICcuL3Byb3BlcnR5JztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBjbGFzc1xuICpcbiAqIEBwYXJhbSBvcHRpb25zIEEge0BsaW5rIENvbXBvbmVudERlY2xhcmF0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50PFR5cGUgZXh0ZW5kcyBDb21wb25lbnQgPSBDb21wb25lbnQ+IChvcHRpb25zOiBQYXJ0aWFsPENvbXBvbmVudERlY2xhcmF0aW9uPFR5cGU+PiA9IHt9KSB7XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHsgLi4uREVGQVVMVF9DT01QT05FTlRfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgIHJldHVybiAodGFyZ2V0OiB0eXBlb2YgQ29tcG9uZW50KSA9PiB7XG5cbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSB0YXJnZXQgYXMgRGVjb3JhdGVkQ29tcG9uZW50VHlwZTtcblxuICAgICAgICBjb25zdHJ1Y3Rvci5zZWxlY3RvciA9IGRlY2xhcmF0aW9uLnNlbGVjdG9yIHx8IHRhcmdldC5zZWxlY3RvcjtcbiAgICAgICAgY29uc3RydWN0b3Iuc2hhZG93ID0gZGVjbGFyYXRpb24uc2hhZG93O1xuICAgICAgICBjb25zdHJ1Y3Rvci50ZW1wbGF0ZSA9IGRlY2xhcmF0aW9uLnRlbXBsYXRlIHx8IHRhcmdldC50ZW1wbGF0ZTtcblxuICAgICAgICAvLyB1c2Uga2V5b2Ygc2lnbmF0dXJlcyB0byBjYXRjaCByZWZhY3RvcmluZyBlcnJvcnNcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZWRBdHRyaWJ1dGVzS2V5OiBrZXlvZiB0eXBlb2YgQ29tcG9uZW50ID0gJ29ic2VydmVkQXR0cmlidXRlcyc7XG4gICAgICAgIGNvbnN0IHN0eWxlc0tleToga2V5b2YgdHlwZW9mIENvbXBvbmVudCA9ICdzdHlsZXMnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm9wZXJ0eSBkZWNvcmF0b3JzIGdldCBjYWxsZWQgYmVmb3JlIGNsYXNzIGRlY29yYXRvcnMsIHNvIGF0IHRoaXMgcG9pbnQgYWxsIGRlY29yYXRlZCBwcm9wZXJ0aWVzXG4gICAgICAgICAqIGhhdmUgc3RvcmVkIHRoZWlyIGFzc29jaWF0ZWQgYXR0cmlidXRlcyBpbiB7QGxpbmsgQ29tcG9uZW50LmF0dHJpYnV0ZXN9LlxuICAgICAgICAgKiBXZSBjYW4gbm93IGNvbWJpbmUgdGhlbSB3aXRoIHRoZSB1c2VyLWRlZmluZWQge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IGFuZCxcbiAgICAgICAgICogYnkgdXNpbmcgYSBTZXQsIGVsaW1pbmF0ZSBhbGwgZHVwbGljYXRlcyBpbiB0aGUgcHJvY2Vzcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQXMgdGhlIHVzZXItZGVmaW5lZCB7QGxpbmsgQ29tcG9uZW50Lm9ic2VydmVkQXR0cmlidXRlc30gd2lsbCBhbHNvIGluY2x1ZGUgZGVjb3JhdG9yIGdlbmVyYXRlZFxuICAgICAgICAgKiBvYnNlcnZlZCBhdHRyaWJ1dGVzLCB3ZSBhbHdheXMgaW5oZXJpdCBhbGwgb2JzZXJ2ZWQgYXR0cmlidXRlcyBmcm9tIGEgYmFzZSBjbGFzcy4gRm9yIHRoYXQgcmVhc29uXG4gICAgICAgICAqIHdlIGhhdmUgdG8ga2VlcCB0cmFjayBvZiBhdHRyaWJ1dGUgb3ZlcnJpZGVzIHdoZW4gZXh0ZW5kaW5nIGFueSB7QGxpbmsgQ29tcG9uZW50fSBiYXNlIGNsYXNzLlxuICAgICAgICAgKiBUaGlzIGlzIGRvbmUgaW4gdGhlIHtAbGluayBwcm9wZXJ0eX0gZGVjb3JhdG9yLiBIZXJlIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRvIHJlbW92ZSBvdmVycmlkZGVuXG4gICAgICAgICAqIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBvYnNlcnZlZEF0dHJpYnV0ZXMgPSBbXG4gICAgICAgICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAgICAgICAgIC8vIHdlIHRha2UgdGhlIGluaGVyaXRlZCBvYnNlcnZlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3Iub2JzZXJ2ZWRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLnJlbW92ZSBvdmVycmlkZGVuIGdlbmVyYXRlZCBhdHRyaWJ1dGVzLi4uXG4gICAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoKGF0dHJpYnV0ZXMsIGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuICYmIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4uaGFzKGF0dHJpYnV0ZSkgPyBbXSA6IGF0dHJpYnV0ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBbXSBhcyBzdHJpbmdbXVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLmFuZCByZWNvbWJpbmUgdGhlIGxpc3Qgd2l0aCB0aGUgbmV3bHkgZ2VuZXJhdGVkIGF0dHJpYnV0ZXMgKHRoZSBTZXQgcHJldmVudHMgZHVwbGljYXRlcylcbiAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChbLi4udGFyZ2V0LmF0dHJpYnV0ZXMua2V5cygpXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBkZWxldGUgdGhlIG92ZXJyaWRkZW4gU2V0IGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgIGRlbGV0ZSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBkb24ndCB3YW50IHRvIGluaGVyaXQgc3R5bGVzIGF1dG9tYXRpY2FsbHksIHVubGVzcyBleHBsaWNpdGx5IHJlcXVlc3RlZCwgc28gd2UgY2hlY2sgaWYgdGhlXG4gICAgICAgICAqIGNvbnN0cnVjdG9yIGRlY2xhcmVzIGEgc3RhdGljIHN0eWxlcyBwcm9wZXJ0eSAod2hpY2ggbWF5IHVzZSBzdXBlci5zdHlsZXMgdG8gZXhwbGljaXRseSBpbmhlcml0KVxuICAgICAgICAgKiBhbmQgaWYgaXQgZG9lc24ndCwgd2UgaWdub3JlIHRoZSBwYXJlbnQgY2xhc3MncyBzdHlsZXMgKGJ5IG5vdCBpbnZva2luZyB0aGUgZ2V0dGVyKS5cbiAgICAgICAgICogV2UgdGhlbiBtZXJnZSB0aGUgZGVjb3JhdG9yIGRlZmluZWQgc3R5bGVzIChpZiBleGlzdGluZykgaW50byB0aGUgc3R5bGVzIGFuZCByZW1vdmUgZHVwbGljYXRlc1xuICAgICAgICAgKiBieSB1c2luZyBhIFNldC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IFtcbiAgICAgICAgICAgIC4uLm5ldyBTZXQoXG4gICAgICAgICAgICAgICAgKGNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHN0eWxlc0tleSlcbiAgICAgICAgICAgICAgICAgICAgPyBjb25zdHJ1Y3Rvci5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgOiBbXVxuICAgICAgICAgICAgICAgICkuY29uY2F0KGRlY2xhcmF0aW9uLnN0eWxlcyB8fCBbXSlcbiAgICAgICAgICAgIClcbiAgICAgICAgXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmluYWxseSB3ZSBvdmVycmlkZSB0aGUge0BsaW5rIENvbXBvbmVudC5vYnNlcnZlZEF0dHJpYnV0ZXN9IGdldHRlciB3aXRoIGEgbmV3IG9uZSwgd2hpY2ggcmV0dXJuc1xuICAgICAgICAgKiB0aGUgdW5pcXVlIHNldCBvZiB1c2VyIGRlZmluZWQgYW5kIGRlY29yYXRvciBnZW5lcmF0ZWQgb2JzZXJ2ZWQgYXR0cmlidXRlcy5cbiAgICAgICAgICovXG4gICAgICAgIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsIG9ic2VydmVkQXR0cmlidXRlc0tleSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBnZXQgKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZWRBdHRyaWJ1dGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2Ugb3ZlcnJpZGUgdGhlIHtAbGluayBDb21wb25lbnQuc3R5bGVzfSBnZXR0ZXIgd2l0aCBhIG5ldyBvbmUsIHdoaWNoIHJldHVybnNcbiAgICAgICAgICogdGhlIHVuaXF1ZSBzZXQgb2Ygc3RhdGljYWxseSBkZWZpbmVkIGFuZCBkZWNvcmF0b3IgZGVmaW5lZCBzdHlsZXMuXG4gICAgICAgICAqL1xuICAgICAgICBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNvbnN0cnVjdG9yLCBzdHlsZXNLZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQgKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3R5bGVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uZGVmaW5lKSB7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoY29uc3RydWN0b3Iuc2VsZWN0b3IsIGNvbnN0cnVjdG9yKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcblxuLyoqXG4gKiBBIHtAbGluayBDb21wb25lbnR9IGV2ZW50IGxpc3RlbmVyIGRlY2xhcmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGVuZXJEZWNsYXJhdGlvbjxUeXBlIGV4dGVuZHMgQ29tcG9uZW50ID0gQ29tcG9uZW50PiB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZXZlbnQgdG8gbGlzdGVuIHRvXG4gICAgICpcbiAgICAgKiBAcmVtYXJrc1xuICAgICAqIFNldHRpbmcgZXZlbnQgdG8gYG51bGxgIGFsbG93cyB0byB1bmJpbmQgYW4gaW5oZXJpdGVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqL1xuICAgIGV2ZW50OiBzdHJpbmcgfCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQW4gb3B0aW9ucyBvYmplY3QgdGhhdCBzcGVjaWZpZXMgY2hhcmFjdGVyaXN0aWNzIGFib3V0IHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAqL1xuICAgIG9wdGlvbnM/OiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucztcblxuICAgIC8qKlxuICAgICAqIEFuIGFsdGVybmF0aXZlIGV2ZW50IHRhcmdldCAoYnkgZGVmYXVsdCB0aGlzIHdpbGwgYmUgdGhlIHtAbGluayBDb21wb25lbnR9IGluc3RhbmNlKVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VmdWwgaWYgeW91IHdhbnQgdG8gbGlzdGVuIHRvIGUuZy46XG4gICAgICogKiB3aW5kb3cub25yZXNpemVcbiAgICAgKiAqIGRvY3VtZW50Lm9ubG9hZFxuICAgICAqICogZG9jdW1lbnQub25zY3JvbGxcbiAgICAgKiAqIFdvcmtlci5vbm1lc3NhZ2VcbiAgICAgKlxuICAgICAqIElmIGEgZnVuY3Rpb24gaXMgcHJvdmlkZWQsIHRoZSBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgYnkgY29tcG9uZW50IGFmdGVyIGl0c1xuICAgICAqIHtAbGluayBjb25uZWN0ZWRDYWxsYmFja30gaGFzIHVwZGF0ZWQgdGhlIGNvbXBvbmVudC4gVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uIHdpbGxcbiAgICAgKiBiZSB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqXG4gICAgICogYGBgdHlwZXNjcmlwdFxuICAgICAqIGNsYXNzIE15RWxlbWVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICpcbiAgICAgKiAgICAgIHdvcmtlcjogV29ya2VyO1xuICAgICAqXG4gICAgICogICAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG4gICAgICogICAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgKiAgICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoJ3dvcmtlci5qcycpO1xuICAgICAqICAgICAgfVxuICAgICAqXG4gICAgICogICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG4gICAgICogICAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKVxuICAgICAqICAgICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAqICAgICAgfVxuICAgICAqXG4gICAgICogICAgICBAbGlzdGVuZXI8TXlFbGVtZW50Pih7XG4gICAgICogICAgICAgICAgZXZlbnQ6ICdtZXNzYWdlJyxcbiAgICAgKiAgICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgICogICAgICB9KVxuICAgICAqICAgICAgb25NZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG4gICAgICogICAgICAgICAgLy8gZG8gc29tZXRoaW5nIHdpdGggZXZlbnQuZGF0YVxuICAgICAqICAgICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICB0YXJnZXQ/OiBFdmVudFRhcmdldCB8ICgodGhpczogVHlwZSkgPT4gRXZlbnRUYXJnZXQpO1xufVxuXG4vKipcbiAqIERlY29yYXRlcyBhIHtAbGluayBDb21wb25lbnR9IG1ldGhvZCBhcyBhbiBldmVudCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBsaXN0ZW5lciBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuZXI8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IExpc3RlbmVyRGVjbGFyYXRpb248VHlwZT4pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBPYmplY3QsIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBDb21wb25lbnQ7XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5ldmVudCA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuZGVsZXRlKHByb3BlcnR5S2V5KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvci5saXN0ZW5lcnMuc2V0KHByb3BlcnR5S2V5LCB7IC4uLm9wdGlvbnMgfSBhcyBMaXN0ZW5lckRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGxpc3RlbmVyIGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgbGlzdGVuZXIgZGVjb3JhdG9yIHN0b3JlcyBsaXN0ZW5lciBkZWNsYXJhdGlvbnMgaW4gdGhlIGNvbnN0cnVjdG9yLCB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGVcbiAqIHN0YXRpYyBsaXN0ZW5lcnMgZmllbGQgaXMgaW5pdGlhbGl6ZWQgb24gdGhlIGN1cnJlbnQgY29uc3RydWN0b3IuIE90aGVyd2lzZSB3ZSBhZGQgbGlzdGVuZXIgZGVjbGFyYXRpb25zXG4gKiB0byB0aGUgYmFzZSBjbGFzcydzIHN0YXRpYyBmaWVsZC4gV2UgYWxzbyBtYWtlIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgbGlzdGVuZXIgbWFwcyB3aXRoIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBiYXNlIGNsYXNzJ3MgbWFwIHRvIHByb3Blcmx5IGluaGVyaXQgYWxsIGxpc3RlbmVyIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29uc3RydWN0b3IgVGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byBwcmVwYXJlXG4gKlxuICogQGludGVybmFsXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29uc3RydWN0b3IgKGNvbnN0cnVjdG9yOiB0eXBlb2YgQ29tcG9uZW50KSB7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KCdsaXN0ZW5lcnMnKSkgY29uc3RydWN0b3IubGlzdGVuZXJzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5saXN0ZW5lcnMpO1xufVxuIiwiLyoqXG4gKiBHZXQgdGhlIHtAbGluayBQcm9wZXJ0eURlc2NyaXB0b3J9IG9mIGEgcHJvcGVydHkgZnJvbSBpdHMgcHJvdG90eXBlXG4gKiBvciBhIHBhcmVudCBwcm90b3R5cGUgLSBleGNsdWRpbmcge0BsaW5rIE9iamVjdC5wcm90b3R5cGV9IGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0ICAgICAgICBUaGUgcHJvdG90eXBlIHRvIGdldCB0aGUgZGVzY3JpcHRvciBmcm9tXG4gKiBAcGFyYW0gcHJvcGVydHlLZXkgICBUaGUgcHJvcGVydHkga2V5IGZvciB3aGljaCB0byBnZXQgdGhlIGRlc2NyaXB0b3JcbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wZXJ0eURlc2NyaXB0b3IgKHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXkpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQge1xuXG4gICAgaWYgKHByb3BlcnR5S2V5IGluIHRhcmdldCkge1xuXG4gICAgICAgIHdoaWxlICh0YXJnZXQgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcblxuICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eUtleSkpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgY3JlYXRlQXR0cmlidXRlTmFtZSwgREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTiwgUHJvcGVydHlEZWNsYXJhdGlvbiB9IGZyb20gJy4vcHJvcGVydHktZGVjbGFyYXRpb24nO1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlEZXNjcmlwdG9yIH0gZnJvbSAnLi91dGlscy9nZXQtcHJvcGVydHktZGVzY3JpcHRvcic7XG5cbi8qKlxuICogQSB0eXBlIGV4dGVuc2lvbiB0byBhZGQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRvIGEge0BsaW5rIENvbXBvbmVudH0gY29uc3RydWN0b3IgZHVyaW5nIGRlY29yYXRpb25cbiAqXG4gKiBAaW50ZXJuYWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSB0eXBlb2YgQ29tcG9uZW50ICYgeyBvdmVycmlkZGVuPzogU2V0PHN0cmluZz4gfTtcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYSB7QGxpbmsgQ29tcG9uZW50fSBwcm9wZXJ0eVxuICpcbiAqIEByZW1hcmtzXG4gKiBNYW55IG9mIHRoZSB7QGxpbmsgUHJvcGVydHlEZWNsYXJhdGlvbn0gb3B0aW9ucyBzdXBwb3J0IGN1c3RvbSBmdW5jdGlvbnMsIHdoaWNoIHdpbGwgYmUgaW52b2tlZFxuICogd2l0aCB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzIGB0aGlzYC1jb250ZXh0IGR1cmluZyBleGVjdXRpb24uIEluIG9yZGVyIHRvIHN1cHBvcnQgY29ycmVjdFxuICogdHlwaW5nIGluIHRoZXNlIGZ1bmN0aW9ucywgdGhlIGBAcHJvcGVydHlgIGRlY29yYXRvciBzdXBwb3J0cyBnZW5lcmljIHR5cGVzLiBIZXJlIGlzIGFuIGV4YW1wbGVcbiAqIG9mIGhvdyB5b3UgY2FuIHVzZSB0aGlzIHdpdGggYSBjdXN0b20ge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICpcbiAqICAgICAgbXlIaWRkZW5Qcm9wZXJ0eSA9IHRydWU7XG4gKlxuICogICAgICAvLyB1c2UgYSBnZW5lcmljIHRvIHN1cHBvcnQgcHJvcGVyIGluc3RhbmNlIHR5cGluZyBpbiB0aGUgcHJvcGVydHkgcmVmbGVjdG9yXG4gKiAgICAgIEBwcm9wZXJ0eTxNeUVsZW1lbnQ+KHtcbiAqICAgICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogKHByb3BlcnR5S2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpIHtcbiAqICAgICAgICAgICAgICAvLyB0aGUgZ2VuZXJpYyB0eXBlIGFsbG93cyBmb3IgY29ycmVjdCB0eXBpbmcgb2YgdGhpc1xuICogICAgICAgICAgICAgIGlmICh0aGlzLm15SGlkZGVuUHJvcGVydHkgJiYgbmV3VmFsdWUpIHtcbiAqICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ215LXByb3BlcnR5JywgJycpO1xuICogICAgICAgICAgICAgIH0gZWxzZSB7XG4gKiAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdteS1wcm9wZXJ0eScpO1xuICogICAgICAgICAgICAgIH1cbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgbXlQcm9wZXJ0eSA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgQSBwcm9wZXJ0eSBkZWNsYXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvcGVydHk8VHlwZSBleHRlbmRzIENvbXBvbmVudCA9IENvbXBvbmVudD4gKG9wdGlvbnM6IFBhcnRpYWw8UHJvcGVydHlEZWNsYXJhdGlvbjxUeXBlPj4gPSB7fSkge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICAgICAgdGFyZ2V0OiBPYmplY3QsXG4gICAgICAgIHByb3BlcnR5S2V5OiBQcm9wZXJ0eUtleSxcbiAgICAgICAgcHJvcGVydHlEZXNjcmlwdG9yPzogUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICk6IGFueSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gZGVmaW5pbmcgY2xhc3NlcyBpbiBUeXBlU2NyaXB0LCBjbGFzcyBmaWVsZHMgYWN0dWFsbHkgZG9uJ3QgZXhpc3Qgb24gdGhlIGNsYXNzJ3MgcHJvdG90eXBlLCBidXRcbiAgICAgICAgICogcmF0aGVyLCB0aGV5IGFyZSBpbnN0YW50aWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBleGlzdCBvbmx5IG9uIHRoZSBpbnN0YW5jZS4gQWNjZXNzb3IgcHJvcGVydGllc1xuICAgICAgICAgKiBhcmUgYW4gZXhjZXB0aW9uIGhvd2V2ZXIgYW5kIGV4aXN0IG9uIHRoZSBwcm90b3R5cGUuIEZ1cnRoZXJtb3JlLCBhY2Nlc3NvcnMgYXJlIGluaGVyaXRlZCBhbmQgd2lsbFxuICAgICAgICAgKiBiZSBpbnZva2VkIHdoZW4gc2V0dGluZyAob3IgZ2V0dGluZykgYSBwcm9wZXJ0eSBvbiBhbiBpbnN0YW5jZSBvZiBhIGNoaWxkIGNsYXNzLCBldmVuIGlmIHRoYXQgY2xhc3NcbiAgICAgICAgICogZGVmaW5lcyB0aGUgcHJvcGVydHkgZmllbGQgb24gaXRzIG93bi4gT25seSBpZiB0aGUgY2hpbGQgY2xhc3MgZGVmaW5lcyBuZXcgYWNjZXNzb3JzIHdpbGwgdGhlIHBhcmVudFxuICAgICAgICAgKiBjbGFzcydzIGFjY2Vzc29ycyBub3QgYmUgaW5oZXJpdGVkLlxuICAgICAgICAgKiBUbyBrZWVwIHRoaXMgYmVoYXZpb3IgaW50YWN0LCB3ZSBuZWVkIHRvIGVuc3VyZSwgdGhhdCB3aGVuIHdlIGNyZWF0ZSBhY2Nlc3NvcnMgZm9yIHByb3BlcnRpZXMsIHdoaWNoXG4gICAgICAgICAqIGFyZSBub3QgZGVjbGFyZWQgYXMgYWNjZXNzb3JzLCB3ZSBpbnZva2UgdGhlIHBhcmVudCBjbGFzcydzIGFjY2Vzc29yIGFzIGV4cGVjdGVkLlxuICAgICAgICAgKiBUaGUge0BsaW5rIGdldFByb3BlcnR5RGVzY3JpcHRvcn0gZnVuY3Rpb24gYWxsb3dzIHVzIHRvIGxvb2sgZm9yIGFjY2Vzc29ycyBvbiB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gICAgICAgICAqIHRoZSBjbGFzcyB3ZSBhcmUgZGVjb3JhdGluZy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBwcm9wZXJ0eURlc2NyaXB0b3IgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICBjb25zdCBoaWRkZW5LZXkgPSAodHlwZW9mIHByb3BlcnR5S2V5ID09PSAnc3RyaW5nJykgPyBgX18keyBwcm9wZXJ0eUtleSB9YCA6IFN5bWJvbCgpO1xuXG4gICAgICAgIC8vIGlmIHdlIGZvdW5kIGFuIGFjY2Vzc29yIGRlc2NyaXB0b3IgKGZyb20gZWl0aGVyIHRoaXMgY2xhc3Mgb3IgYSBwYXJlbnQpIHdlIHVzZSBpdCwgb3RoZXJ3aXNlIHdlIGNyZWF0ZVxuICAgICAgICAvLyBkZWZhdWx0IGFjY2Vzc29ycyB0byBzdG9yZSB0aGUgYWN0dWFsIHByb3BlcnR5IHZhbHVlIGluIGEgaGlkZGVuIGZpZWxkIGFuZCByZXRyaWV2ZSBpdCBmcm9tIHRoZXJlXG4gICAgICAgIGNvbnN0IGdldHRlciA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5nZXQgfHwgZnVuY3Rpb24gKHRoaXM6IGFueSkgeyByZXR1cm4gdGhpc1toaWRkZW5LZXldOyB9O1xuICAgICAgICBjb25zdCBzZXR0ZXIgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3Iuc2V0IHx8IGZ1bmN0aW9uICh0aGlzOiBhbnksIHZhbHVlOiBhbnkpIHsgdGhpc1toaWRkZW5LZXldID0gdmFsdWU7IH07XG5cbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgbmV3IGFjY2Vzc29yIGRlc2NyaXB0b3Igd2hpY2ggd2lsbCB3cmFwIHRoZSBwcmV2aW91c2x5IHJldHJpZXZlZCBvciBjcmVhdGVkIGFjY2Vzc29yc1xuICAgICAgICAvLyBhbmQgcmVxdWVzdCBhbiB1cGRhdGUgb2YgdGhlIGNvbXBvbmVudCB3aGVuZXZlciB0aGUgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgIGNvbnN0IHdyYXBwZWREZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IgJiBUaGlzVHlwZTxhbnk+ID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCAoKTogYW55IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0ICh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0aGlzW3Byb3BlcnR5S2V5XTtcbiAgICAgICAgICAgICAgICBzZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGFzcyBgdmFsdWVgIG9uIGFzIGBuZXdWYWx1ZWAgLSBhbiBpbmhlcml0ZWQgc2V0dGVyIG1pZ2h0IG1vZGlmeSBpdFxuICAgICAgICAgICAgICAgIC8vIGluc3RlYWQgZ2V0IHRoZSBuZXcgdmFsdWUgYnkgaW52b2tpbmcgdGhlIGdldHRlclxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZShwcm9wZXJ0eUtleSwgb2xkVmFsdWUsIGdldHRlci5jYWxsKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gdGFyZ2V0LmNvbnN0cnVjdG9yIGFzIERlY29yYXRlZENvbXBvbmVudFR5cGU7XG5cbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb246IFByb3BlcnR5RGVjbGFyYXRpb248VHlwZT4gPSB7IC4uLkRFRkFVTFRfUFJPUEVSVFlfREVDTEFSQVRJT04sIC4uLm9wdGlvbnMgfTtcblxuICAgICAgICAvLyBnZW5lcmF0ZSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGUgbmFtZVxuICAgICAgICBpZiAoZGVjbGFyYXRpb24uYXR0cmlidXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGRlY2xhcmF0aW9uLmF0dHJpYnV0ZSA9IGNyZWF0ZUF0dHJpYnV0ZU5hbWUocHJvcGVydHlLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0IHRoZSBkZWZhdWx0IHByb3BlcnR5IGNoYW5nZSBkZXRlY3RvclxuICAgICAgICBpZiAoZGVjbGFyYXRpb24ub2JzZXJ2ZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBkZWNsYXJhdGlvbi5vYnNlcnZlID0gREVGQVVMVF9QUk9QRVJUWV9ERUNMQVJBVElPTi5vYnNlcnZlO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJlcGFyZUNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKTtcblxuICAgICAgICAvLyBjaGVjayBpZiB3ZSBpbmhlcml0ZWQgYW4gb2JzZXJ2ZWQgYXR0cmlidXRlIGZvciB0aGUgcHJvcGVydHkgZnJvbSB0aGUgYmFzZSBjbGFzc1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmhhcyhwcm9wZXJ0eUtleSkgPyBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzLmdldChwcm9wZXJ0eUtleSkhLmF0dHJpYnV0ZSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBpZiBhdHRyaWJ1dGUgaXMgdHJ1dGh5IGl0J3MgYSBzdHJpbmcgYW5kIGl0IHdpbGwgZXhpc3QgaW4gdGhlIGF0dHJpYnV0ZXMgbWFwXG4gICAgICAgIGlmIChhdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBpbmhlcml0ZWQgYXR0cmlidXRlIGFzIGl0J3Mgb3ZlcnJpZGRlblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5kZWxldGUoYXR0cmlidXRlIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBtYXJrIGF0dHJpYnV0ZSBhcyBvdmVycmlkZGVuIGZvciB7QGxpbmsgY29tcG9uZW50fSBkZWNvcmF0b3JcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yLm92ZXJyaWRkZW4hLmFkZChhdHRyaWJ1dGUgYXMgc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbi5hdHRyaWJ1dGUpIHtcblxuICAgICAgICAgICAgY29uc3RydWN0b3IuYXR0cmlidXRlcy5zZXQoZGVjbGFyYXRpb24uYXR0cmlidXRlLCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSB0aGUgcHJvcGVydHkgZGVjbGFyYXRpb24gKmFmdGVyKiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzLCBzbyB3ZSBjYW4gc3RpbGwgYWNjZXNzIHRoZVxuICAgICAgICAvLyBpbmhlcml0ZWQgcHJvcGVydHkgZGVjbGFyYXRpb24gd2hlbiBwcm9jZXNzaW5nIHRoZSBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0cnVjdG9yLnByb3BlcnRpZXMuc2V0KHByb3BlcnR5S2V5LCBkZWNsYXJhdGlvbiBhcyBQcm9wZXJ0eURlY2xhcmF0aW9uKTtcblxuICAgICAgICBpZiAoIXByb3BlcnR5RGVzY3JpcHRvcikge1xuXG4gICAgICAgICAgICAvLyBpZiBubyBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBkZWNvcmF0b3Igd2hpY2ggbXVzdCByZXR1cm4gdm9pZCBhbmQgd2UgY2FuIGRlZmluZSB0aGUgd3JhcHBlZCBkZXNjcmlwdG9yIGhlcmVcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCB3cmFwcGVkRGVzY3JpcHRvcik7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gaWYgYSBwcm9wZXJ0eURlc2NyaXB0b3Igd2FzIGRlZmluZWQgZm9yIHRoaXMgZGVjb3JhdG9yLCB0aGlzIGRlY29yYXRvciBpcyBhbiBhY2Nlc3NvclxuICAgICAgICAgICAgLy8gZGVjb3JhdG9yIGFuZCB3ZSBtdXN0IHJldHVybiB0aGUgd3JhcHBlZCBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZERlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIGJ5IGluaXRpYWxpemluZyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIHByb3BlcnR5IGRlY29yYXRvcixcbiAqIHNvIHdlIGRvbid0IG1vZGlmeSBhIGJhc2UgY2xhc3MncyBzdGF0aWMgcHJvcGVydGllcy5cbiAqXG4gKiBAcmVtYXJrc1xuICogV2hlbiB0aGUgcHJvcGVydHkgZGVjb3JhdG9yIHN0b3JlcyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYW5kIGF0dHJpYnV0ZSBtYXBwaW5ncyBpbiB0aGUgY29uc3RydWN0b3IsXG4gKiB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aG9zZSBzdGF0aWMgZmllbGRzIGFyZSBpbml0aWFsaXplZCBvbiB0aGUgY3VycmVudCBjb25zdHJ1Y3Rvci4gT3RoZXJ3aXNlIHdlXG4gKiBhZGQgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGUgbWFwcGluZ3MgdG8gdGhlIGJhc2UgY2xhc3MncyBzdGF0aWMgZmllbGRzLiBXZSBhbHNvIG1ha2VcbiAqIHN1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgY29uc3RydWN0b3JzIG1hcHMgd2l0aCB0aGUgdmFsdWVzIG9mIHRoZSBiYXNlIGNsYXNzJ3MgbWFwcyB0byBwcm9wZXJseVxuICogaW5oZXJpdCBhbGwgcHJvcGVydHkgZGVjbGFyYXRpb25zIGFuZCBhdHRyaWJ1dGVzLlxuICpcbiAqIEBwYXJhbSBjb25zdHJ1Y3RvciBUaGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHByZXBhcmVcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZnVuY3Rpb24gcHJlcGFyZUNvbnN0cnVjdG9yIChjb25zdHJ1Y3RvcjogRGVjb3JhdGVkQ29tcG9uZW50VHlwZSkge1xuXG4gICAgLy8gdGhpcyB3aWxsIGdpdmUgdXMgYSBjb21waWxlLXRpbWUgZXJyb3IgaWYgd2UgcmVmYWN0b3Igb25lIG9mIHRoZSBzdGF0aWMgY29uc3RydWN0b3IgcHJvcGVydGllc1xuICAgIC8vIGFuZCB3ZSB3b24ndCBtaXNzIHJlbmFtaW5nIHRoZSBwcm9wZXJ0eSBrZXlzXG4gICAgY29uc3QgcHJvcGVydGllczoga2V5b2YgRGVjb3JhdGVkQ29tcG9uZW50VHlwZSA9ICdwcm9wZXJ0aWVzJztcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiBrZXlvZiBEZWNvcmF0ZWRDb21wb25lbnRUeXBlID0gJ2F0dHJpYnV0ZXMnO1xuICAgIGNvbnN0IG92ZXJyaWRkZW46IGtleW9mIERlY29yYXRlZENvbXBvbmVudFR5cGUgPSAnb3ZlcnJpZGRlbic7XG5cbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KHByb3BlcnRpZXMpKSBjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5wcm9wZXJ0aWVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZXMpKSBjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzID0gbmV3IE1hcChjb25zdHJ1Y3Rvci5hdHRyaWJ1dGVzKTtcbiAgICBpZiAoIWNvbnN0cnVjdG9yLmhhc093blByb3BlcnR5KG92ZXJyaWRkZW4pKSBjb25zdHJ1Y3Rvci5vdmVycmlkZGVuID0gbmV3IFNldCgpO1xufVxuIiwiLyoqXG4gKiBBIHNpbXBsZSBjc3MgdGVtcGxhdGUgbGl0ZXJhbCB0YWdcbiAqXG4gKiBAcmVtYXJrc1xuICogVGhlIHRhZyBpdHNlbGYgZG9lc24ndCBkbyBhbnl0aGluZyB0aGF0IGFuIHVudGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWwgd291bGRuJ3QgZG8sIGJ1dCBpdCBjYW4gYmUgdXNlZCBieVxuICogZWRpdG9yIHBsdWdpbnMgdG8gaW5mZXIgdGhlIFwidmlydHVhbCBkb2N1bWVudCB0eXBlXCIgdG8gcHJvdmlkZSBjb2RlIGNvbXBsZXRpb24gYW5kIGhpZ2hsaWdodGluZy4gSXQgY291bGRcbiAqIGFsc28gYmUgdXNlZCBpbiB0aGUgZnV0dXJlIHRvIG1vcmUgc2VjdXJlbHkgY29udmVydCBzdWJzdGl0dXRpb25zIGludG8gc3RyaW5ncy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCBjb2xvciA9ICdncmVlbic7XG4gKlxuICogY29uc3QgbWl4aW5Cb3ggPSAoYm9yZGVyV2lkdGg6IHN0cmluZyA9ICcxcHgnLCBib3JkZXJDb2xvcjogc3RyaW5nID0gJ3NpbHZlcicpID0+IGNzc2BcbiAqICAgZGlzcGxheTogYmxvY2s7XG4gKiAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gKiAgIGJvcmRlcjogJHtib3JkZXJXaWR0aH0gc29saWQgJHtib3JkZXJDb2xvcn07XG4gKiBgO1xuICpcbiAqIGNvbnN0IG1peGluSG92ZXIgPSAoc2VsZWN0b3I6IHN0cmluZykgPT4gY3NzYFxuICogJHsgc2VsZWN0b3IgfTpob3ZlciB7XG4gKiAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWhvdmVyLWNvbG9yLCBkb2RnZXJibHVlKTtcbiAqIH1cbiAqIGA7XG4gKlxuICogY29uc3Qgc3R5bGVzID0gY3NzYFxuICogOmhvc3Qge1xuICogICAtLWhvdmVyLWNvbG9yOiAkeyBjb2xvciB9O1xuICogICBkaXNwbGF5OiBibG9jaztcbiAqICAgJHsgbWl4aW5Cb3goKSB9XG4gKiB9XG4gKiAkeyBtaXhpbkhvdmVyKCc6aG9zdCcpIH1cbiAqIDo6c2xvdHRlZCgqKSB7XG4gKiAgIG1hcmdpbjogMDtcbiAqIH1cbiAqIGA7XG4gKlxuICogLy8gd2lsbCBwcm9kdWNlLi4uXG4gKiA6aG9zdCB7XG4gKiAtLWhvdmVyLWNvbG9yOiBncmVlbjtcbiAqIGRpc3BsYXk6IGJsb2NrO1xuICpcbiAqIGRpc3BsYXk6IGJsb2NrO1xuICogYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAqIGJvcmRlcjogMXB4IHNvbGlkIHNpbHZlcjtcbiAqXG4gKiB9XG4gKlxuICogOmhvc3Q6aG92ZXIge1xuICogYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuICogfVxuICpcbiAqIDo6c2xvdHRlZCgqKSB7XG4gKiBtYXJnaW46IDA7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IGNzcyA9IChsaXRlcmFsczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKSA9PiB7XG5cbiAgICByZXR1cm4gc3Vic3RpdHV0aW9ucy5yZWR1Y2UoKHByZXY6IHN0cmluZywgY3VycjogYW55LCBpOiBudW1iZXIpID0+IHByZXYgKyBjdXJyICsgbGl0ZXJhbHNbaSArIDFdLCBsaXRlcmFsc1swXSk7XG59O1xuXG4vLyBjb25zdCBjb2xvciA9ICdncmVlbic7XG5cbi8vIGNvbnN0IG1peGluQm94ID0gKGJvcmRlcldpZHRoOiBzdHJpbmcgPSAnMXB4JywgYm9yZGVyQ29sb3I6IHN0cmluZyA9ICdzaWx2ZXInKSA9PiBjc3NgXG4vLyAgIGRpc3BsYXk6IGJsb2NrO1xuLy8gICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuLy8gICBib3JkZXI6ICR7Ym9yZGVyV2lkdGh9IHNvbGlkICR7Ym9yZGVyQ29sb3J9O1xuLy8gYDtcblxuLy8gY29uc3QgbWl4aW5Ib3ZlciA9IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBjc3NgXG4vLyAkeyBzZWxlY3RvciB9OmhvdmVyIHtcbi8vICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taG92ZXItY29sb3IsIGRvZGdlcmJsdWUpO1xuLy8gfVxuLy8gYDtcblxuLy8gY29uc3Qgc3R5bGVzID0gY3NzYFxuLy8gOmhvc3Qge1xuLy8gICAtLWhvdmVyLWNvbG9yOiAkeyBjb2xvciB9O1xuLy8gICBkaXNwbGF5OiBibG9jaztcbi8vICAgJHsgbWl4aW5Cb3goKSB9XG4vLyB9XG5cbi8vICR7IG1peGluSG92ZXIoJzpob3N0JykgfVxuXG4vLyA6OnNsb3R0ZWQoKikge1xuLy8gICBtYXJnaW46IDA7XG4vLyB9XG4vLyBgO1xuXG4vLyBjb25zb2xlLmxvZyhzdHlsZXMpO1xuIiwiZXhwb3J0IGNvbnN0IEFycm93VXAgPSAnQXJyb3dVcCc7XG5leHBvcnQgY29uc3QgQXJyb3dEb3duID0gJ0Fycm93RG93bic7XG5leHBvcnQgY29uc3QgQXJyb3dMZWZ0ID0gJ0Fycm93TGVmdCc7XG5leHBvcnQgY29uc3QgQXJyb3dSaWdodCA9ICdBcnJvd1JpZ2h0JztcbmV4cG9ydCBjb25zdCBFbnRlciA9ICdFbnRlcic7XG5leHBvcnQgY29uc3QgRXNjYXBlID0gJ0VzY2FwZSc7XG5leHBvcnQgY29uc3QgU3BhY2UgPSAnICc7XG5leHBvcnQgY29uc3QgVGFiID0gJ1RhYic7XG5leHBvcnQgY29uc3QgQmFja3NwYWNlID0gJ0JhY2tzcGFjZSc7XG5leHBvcnQgY29uc3QgQWx0ID0gJ0FsdCc7XG5leHBvcnQgY29uc3QgU2hpZnQgPSAnU2hpZnQnO1xuZXhwb3J0IGNvbnN0IENvbnRyb2wgPSAnQ29udHJvbCc7XG5leHBvcnQgY29uc3QgTWV0YSA9ICdNZXRhJztcbiIsImltcG9ydCB7IEFycm93RG93biwgQXJyb3dMZWZ0LCBBcnJvd1JpZ2h0LCBBcnJvd1VwIH0gZnJvbSAnLi9rZXlzJztcblxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICBkaXNhYmxlZD86IGJvb2xlYW47XG59XG5cbnR5cGUgTGlzdEVudHJ5PFQgZXh0ZW5kcyBMaXN0SXRlbT4gPSBbbnVtYmVyIHwgdW5kZWZpbmVkLCBUIHwgdW5kZWZpbmVkXTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVJdGVtQ2hhbmdlPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBDdXN0b21FdmVudCB7XG4gICAgdHlwZTogJ2FjdGl2ZS1pdGVtLWNoYW5nZSc7XG4gICAgZGV0YWlsOiB7XG4gICAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgICAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgaXRlbTogVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgaW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGl0ZW06IFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaXN0S2V5TWFuYWdlcjxUIGV4dGVuZHMgTGlzdEl0ZW0+IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuXG4gICAgcHJvdGVjdGVkIGFjdGl2ZUluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgcHJvdGVjdGVkIGFjdGl2ZUl0ZW06IFQgfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIHByb3RlY3RlZCBpdGVtVHlwZTogYW55O1xuXG4gICAgcHVibGljIGl0ZW1zOiBUW107XG5cbiAgICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHB1YmxpYyBob3N0OiBIVE1MRWxlbWVudCxcbiAgICAgICAgaXRlbXM6IE5vZGVMaXN0T2Y8VD4sXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcgPSAndmVydGljYWwnKSB7XG5cbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gQXJyYXkuZnJvbShpdGVtcyk7XG4gICAgICAgIHRoaXMuaXRlbVR5cGUgPSB0aGlzLml0ZW1zWzBdICYmIHRoaXMuaXRlbXNbMF0uY29uc3RydWN0b3I7XG5cbiAgICAgICAgdGhpcy5iaW5kSG9zdCgpO1xuICAgIH1cblxuICAgIGdldEFjdGl2ZUl0ZW0gKCk6IFQgfCB1bmRlZmluZWQge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUl0ZW07XG4gICAgfTtcblxuICAgIHNldEFjdGl2ZUl0ZW0gKGl0ZW06IFQpIHtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgY29uc3QgZW50cnk6IExpc3RFbnRyeTxUPiA9IFtcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID4gLTEgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5zZXRFbnRyeUFjdGl2ZShlbnRyeSk7XG4gICAgfVxuXG4gICAgc2V0TmV4dEl0ZW1BY3RpdmUgKCkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXROZXh0RW50cnkoKSk7XG4gICAgfVxuXG4gICAgc2V0UHJldmlvdXNJdGVtQWN0aXZlICgpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0UHJldmlvdXNFbnRyeSgpKTtcbiAgICB9XG5cbiAgICBzZXRGaXJzdEl0ZW1BY3RpdmUgKCkge1xuXG4gICAgICAgIHRoaXMuc2V0RW50cnlBY3RpdmUodGhpcy5nZXRGaXJzdEVudHJ5KCkpO1xuICAgIH1cblxuICAgIHNldExhc3RJdGVtQWN0aXZlICgpIHtcblxuICAgICAgICB0aGlzLnNldEVudHJ5QWN0aXZlKHRoaXMuZ2V0TGFzdEVudHJ5KCkpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgY29uc3QgW3ByZXYsIG5leHRdID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gW0Fycm93TGVmdCwgQXJyb3dSaWdodF0gOiBbQXJyb3dVcCwgQXJyb3dEb3duXTtcbiAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIHByZXY6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIG5leHQ6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJldkluZGV4ICE9PSB0aGlzLmFjdGl2ZUluZGV4KSB0aGlzLmRpc3BhdGNoQWN0aXZlSXRlbUNoYW5nZShwcmV2SW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2Vkb3duIChldmVudDogTW91c2VFdmVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBUKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUZvY3VzIChldmVudDogRm9jdXNFdmVudCkge1xuXG4gICAgICAgIGlmICh0aGlzLml0ZW1UeXBlICYmIGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIHRoaXMuaXRlbVR5cGUpIHtcblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVJdGVtKGV2ZW50LnRhcmdldCBhcyBUKTtcblxuICAgICAgICAgICAgaWYgKHByZXZJbmRleCAhPT0gdGhpcy5hY3RpdmVJbmRleCkgdGhpcy5kaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UocHJldkluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkaXNwYXRjaEFjdGl2ZUl0ZW1DaGFuZ2UgKHByZXZpb3VzSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50OiBBY3RpdmVJdGVtQ2hhbmdlPFQ+ID0gbmV3IEN1c3RvbUV2ZW50KCdhY3RpdmUtaXRlbS1jaGFuZ2UnLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHByZXZpb3VzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06ICh0eXBlb2YgcHJldmlvdXNJbmRleCA9PT0gJ251bWJlcicpID8gdGhpcy5pdGVtc1twcmV2aW91c0luZGV4XSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3VycmVudDoge1xuICAgICAgICAgICAgICAgICAgICBpbmRleDogdGhpcy5hY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogdGhpcy5hY3RpdmVJdGVtXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSBhcyBBY3RpdmVJdGVtQ2hhbmdlPFQ+O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEVudHJ5QWN0aXZlIChlbnRyeTogTGlzdEVudHJ5PFQ+KSB7XG5cbiAgICAgICAgW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV0gPSBlbnRyeTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TmV4dEVudHJ5IChmcm9tSW5kZXg/OiBudW1iZXIpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIGZyb21JbmRleCA9ICh0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgID8gZnJvbUluZGV4XG4gICAgICAgICAgICA6ICh0eXBlb2YgdGhpcy5hY3RpdmVJbmRleCA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZUluZGV4XG4gICAgICAgICAgICAgICAgOiAtMTtcblxuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLml0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgIGxldCBuZXh0SW5kZXggPSBmcm9tSW5kZXggKyAxO1xuICAgICAgICBsZXQgbmV4dEl0ZW0gPSB0aGlzLml0ZW1zW25leHRJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKG5leHRJbmRleCA8IGxhc3RJbmRleCAmJiBuZXh0SXRlbSAmJiBuZXh0SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBuZXh0SXRlbSA9IHRoaXMuaXRlbXNbKytuZXh0SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChuZXh0SXRlbSAmJiAhbmV4dEl0ZW0uZGlzYWJsZWQpID8gW25leHRJbmRleCwgbmV4dEl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFByZXZpb3VzRW50cnkgKGZyb21JbmRleD86IG51bWJlcik6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgZnJvbUluZGV4ID0gKHR5cGVvZiBmcm9tSW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICAgPyBmcm9tSW5kZXhcbiAgICAgICAgICAgIDogKHR5cGVvZiB0aGlzLmFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlSW5kZXhcbiAgICAgICAgICAgICAgICA6IDA7XG5cbiAgICAgICAgbGV0IHByZXZJbmRleCA9IGZyb21JbmRleCAtIDE7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbcHJldkluZGV4XTtcblxuICAgICAgICB3aGlsZSAocHJldkluZGV4ID4gMCAmJiBwcmV2SXRlbSAmJiBwcmV2SXRlbS5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBwcmV2SXRlbSA9IHRoaXMuaXRlbXNbLS1wcmV2SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChwcmV2SXRlbSAmJiAhcHJldkl0ZW0uZGlzYWJsZWQpID8gW3ByZXZJbmRleCwgcHJldkl0ZW1dIDogW3RoaXMuYWN0aXZlSW5kZXgsIHRoaXMuYWN0aXZlSXRlbV07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldEZpcnN0RW50cnkgKCk6IExpc3RFbnRyeTxUPiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEVudHJ5KC0xKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TGFzdEVudHJ5ICgpOiBMaXN0RW50cnk8VD4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFByZXZpb3VzRW50cnkodGhpcy5pdGVtcy5sZW5ndGgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaW5kSG9zdCAoKSB7XG5cbiAgICAgICAgLy8gVE9ETzogZW5hYmxlIHJlY29ubmVjdGluZyB0aGUgaG9zdCBlbGVtZW50PyBubyBuZWVkIGlmIEZvY3VzTWFuYWdlciBpcyBjcmVhdGVkIGluIGNvbm5lY3RlZENhbGxiYWNrXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IE1hcChbXG4gICAgICAgICAgICBbJ2ZvY3VzaW4nLCB0aGlzLmhhbmRsZUZvY3VzLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lcl0sXG4gICAgICAgICAgICBbJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZWRvd24uYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXSxcbiAgICAgICAgICAgIFsnZGlzY29ubmVjdGVkJywgdGhpcy51bmJpbmRIb3N0LmJpbmQodGhpcyldXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHVuYmluZEhvc3QgKCkge1xuXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4gdGhpcy5ob3N0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9jdXNLZXlNYW5hZ2VyPFQgZXh0ZW5kcyBMaXN0SXRlbT4gZXh0ZW5kcyBMaXN0S2V5TWFuYWdlcjxUPiB7XG5cbiAgICBwcm90ZWN0ZWQgc2V0RW50cnlBY3RpdmUgKGVudHJ5OiBMaXN0RW50cnk8VD4pIHtcblxuICAgICAgICBzdXBlci5zZXRFbnRyeUFjdGl2ZShlbnRyeSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlSXRlbSkgdGhpcy5hY3RpdmVJdGVtLmZvY3VzKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyIH0gZnJvbSAnLi4vLi4vc3JjJztcblxuZXhwb3J0IGNvbnN0IEFSSUFCb29sZWFuQ29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXI8Ym9vbGVhbj4gPSB7XG4gICAgZnJvbUF0dHJpYnV0ZTogKHZhbHVlKSA9PiB2YWx1ZSA9PT0gJ3RydWUnLFxuICAgIHRvQXR0cmlidXRlOiAodmFsdWUpID0+ICh2YWx1ZSA9PSBudWxsKSA/IHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKVxufTtcbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBwcm9wZXJ0eSwgaHRtbCB9IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBjc3MgfSBmcm9tICcuLi8uLi8uLi9zcmMvY3NzJztcblxuQGNvbXBvbmVudDxJY29uPih7XG4gICAgc2VsZWN0b3I6ICd1aS1pY29uJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgd2lkdGg6IHZhcigtLWxpbmUtaGVpZ2h0LCAxLjVlbSk7XG4gICAgICAgIGhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKTtcbiAgICAgICAgcGFkZGluZzogY2FsYygodmFyKC0tbGluZS1oZWlnaHQsIDEuNWVtKSAtIHZhcigtLWZvbnQtc2l6ZSwgMWVtKSkgLyAyKTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IGJvdHRvbTtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB9XG4gICAgc3ZnIHtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICAgICAgb3ZlcmZsb3c6IHZpc2libGU7XG4gICAgICAgIGZpbGw6IHZhcigtLWljb24tY29sb3IsIGN1cnJlbnRDb2xvcik7XG4gICAgfVxuICAgIDpob3N0KFtkYXRhLXNldD11bmldKSB7XG4gICAgICAgIHBhZGRpbmc6IDBlbTtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PW1hdF0pIHtcbiAgICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gICAgOmhvc3QoW2RhdGEtc2V0PWVpXSkge1xuICAgICAgICBwYWRkaW5nOiAwO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKGVsZW1lbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0ID0gZWxlbWVudC5zZXQ7XG4gICAgICAgIGNvbnN0IGljb24gPSAoc2V0ID09PSAnbWF0JylcbiAgICAgICAgICAgID8gYGljXyR7IGVsZW1lbnQuaWNvbiB9XzI0cHhgXG4gICAgICAgICAgICA6IChzZXQgPT09ICdlaScpXG4gICAgICAgICAgICAgICAgPyBgZWktJHsgZWxlbWVudC5pY29uIH0taWNvbmBcbiAgICAgICAgICAgICAgICA6IGVsZW1lbnQuaWNvbjtcblxuICAgICAgICByZXR1cm4gaHRtbGBcbiAgICAgICAgPHN2ZyBmb2N1c2FibGU9XCJmYWxzZVwiPlxuICAgICAgICAgICAgPHVzZSBocmVmPVwiJHsgKGVsZW1lbnQuY29uc3RydWN0b3IgYXMgdHlwZW9mIEljb24pLmdldFNwcml0ZShzZXQpIH0jJHsgaWNvbiB9XCJcbiAgICAgICAgICAgIHhsaW5rOmhyZWY9XCIkeyAoZWxlbWVudC5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgSWNvbikuZ2V0U3ByaXRlKHNldCkgfSMkeyBpY29uIH1cIiAvPlxuICAgICAgICA8L3N2Zz5gO1xuICAgIH1cbn0pXG5leHBvcnQgY2xhc3MgSWNvbiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCBmb3IgY2FjaGluZyBhbiBpY29uIHNldCdzIHNwcml0ZSB1cmxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc3RhdGljIF9zcHJpdGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBzdmcgc3ByaXRlIHVybCBmb3IgdGhlIHJlcXVlc3RlZCBpY29uIHNldFxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgc3ByaXRlIHVybCBmb3IgYW4gaWNvbiBzZXQgY2FuIGJlIHNldCB0aHJvdWdoIGEgYG1ldGFgIHRhZyBpbiB0aGUgaHRtbCBkb2N1bWVudC4gWW91IGNhbiBkZWZpbmVcbiAgICAgKiBjdXN0b20gaWNvbiBzZXRzIGJ5IGNob3NpbmcgYW4gaWRlbnRpZmllciAoc3VjaCBhcyBgOm15c2V0YCBpbnN0ZWFkIG9mIGA6ZmFgLCBgOm1hdGAgb3IgYDppZWApIGFuZFxuICAgICAqIGNvbmZpZ3VyaW5nIGl0cyBsb2NhdGlvbi5cbiAgICAgKlxuICAgICAqIGBgYGh0bWxcbiAgICAgKiA8IWRvY3R5cGUgaHRtbD5cbiAgICAgKiA8aHRtbD5cbiAgICAgKiAgICA8aGVhZD5cbiAgICAgKiAgICA8IS0tIHN1cHBvcnRzIG11bHRpcGxlIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZmFcIiBjb250ZW50PVwiYXNzZXRzL2ljb25zL3Nwcml0ZXMvZm9udC1hd2Vzb21lL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bWF0XCIgY29udGVudD1cImFzc2V0cy9pY29ucy9zcHJpdGVzL21hdGVyaWFsL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6ZWlcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9ldmlsLWljb25zL3Nwcml0ZS5zdmdcIiAvPlxuICAgICAqICAgIDwhLS0gc3VwcG9ydHMgY3VzdG9tIHN2ZyBzcHJpdGVzIC0tPlxuICAgICAqICAgIDxtZXRhIG5hbWU9XCJ1aS1pY29uOnN2Zy1zcHJpdGU6bXlzZXRcIiBjb250ZW50PVwiYXNzZXRzL2ljb24vc3ByaXRlcy9teXNldC9teV9zcHJpdGUuc3ZnXCIgLz5cbiAgICAgKiAgICA8L2hlYWQ+XG4gICAgICogICAgLi4uXG4gICAgICogPC9odG1sPlxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogV2hlbiB1c2luZyB0aGUgaWNvbiBlbGVtZW50LCBzcGVjaWZ5IHlvdXIgY3VzdG9tIGljb24gc2V0LlxuICAgICAqXG4gICAgICogYGBgaHRtbFxuICAgICAqIDwhLS0gdXNlIGF0dHJpYnV0ZXMgLS0+XG4gICAgICogPHVpLWljb24gZGF0YS1pY29uPVwibXlfaWNvbl9pZFwiIGRhdGEtc2V0PVwibXlzZXRcIj48L3VpLWljb24+XG4gICAgICogPCEtLSBvciB1c2UgcHJvcGVydHkgYmluZGluZ3Mgd2l0aGluIGxpdC1odG1sIHRlbXBsYXRlcyAtLT5cbiAgICAgKiA8dWktaWNvbiAuaWNvbj0keydteV9pY29uX2lkJ30gLnNldD0keydteXNldCd9PjwvdWktaWNvbj5cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIElmIG5vIHNwcml0ZSB1cmwgaXMgc3BlY2lmaWVkIGZvciBhIHNldCwgdGhlIGljb24gZWxlbWVudCB3aWxsIGF0dGVtcHQgdG8gdXNlIGFuIHN2ZyBpY29uIGZyb21cbiAgICAgKiBhbiBpbmxpbmVkIHN2ZyBlbGVtZW50IGluIHRoZSBjdXJyZW50IGRvY3VtZW50LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzdGF0aWMgZ2V0U3ByaXRlIChzZXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9zcHJpdGVzLmhhcyhzZXQpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBtZXRhW25hbWU9XCJ1aS1pY29uOnNwcml0ZTokeyBzZXQgfVwiXVtjb250ZW50XWApO1xuXG4gICAgICAgICAgICBpZiAobWV0YSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlcy5zZXQoc2V0LCBtZXRhLmdldEF0dHJpYnV0ZSgnY29udGVudCcpISk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3ByaXRlcy5nZXQoc2V0KSB8fCAnJztcbiAgICB9XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdkYXRhLWljb24nXG4gICAgfSlcbiAgICBpY29uID0gJ2luZm8nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnZGF0YS1zZXQnXG4gICAgfSlcbiAgICBzZXQgPSAnZmEnXG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncm9sZScsICdpbWcnKTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsIENvbXBvbmVudCwgY29tcG9uZW50LCBodG1sLCBwcm9wZXJ0eSwgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBsaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBjc3MgfSBmcm9tICcuLi8uLi8uLi9zcmMvY3NzJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi4vYXJpYS1ib29sZWFuLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBFbnRlciwgU3BhY2UgfSBmcm9tICcuLi9rZXlzJztcbmltcG9ydCAnLi4vaWNvbi9pY29uJztcblxuQGNvbXBvbmVudDxBY2NvcmRpb25IZWFkZXI+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1oZWFkZXInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGFsbDogaW5oZXJpdDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1mbG93OiByb3c7XG4gICAgICAgIGZsZXg6IDEgMSAxMDAlO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLWRpc2FibGVkPXRydWVdKSB7XG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcbiAgICB9XG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9dHJ1ZV0pID4gdWktaWNvbi5leHBhbmQsXG4gICAgOmhvc3QoW2FyaWEtZXhwYW5kZWQ9ZmFsc2VdKSA+IHVpLWljb24uY29sbGFwc2Uge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogZWxlbWVudCA9PiBodG1sYFxuICAgIDxzbG90Pjwvc2xvdD5cbiAgICA8dWktaWNvbiBjbGFzcz1cImNvbGxhcHNlXCIgZGF0YS1pY29uPVwibWludXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICA8dWktaWNvbiBjbGFzcz1cImV4cGFuZFwiIGRhdGEtaWNvbj1cInBsdXNcIiBkYXRhLXNldD1cInVuaVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvdWktaWNvbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvbkhlYWRlciBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcm90ZWN0ZWQgX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6ICdhcmlhLWRpc2FibGVkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlclxuICAgIH0pXG4gICAgZ2V0IGRpc2FibGVkICgpOiBib29sZWFuIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkICh2YWx1ZTogYm9vbGVhbikge1xuXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB2YWx1ZSA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtZXhwYW5kZWQnLFxuICAgICAgICBjb252ZXJ0ZXI6IEFSSUFCb29sZWFuQ29udmVydGVyXG4gICAgfSlcbiAgICBleHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICBjb250cm9scyE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIHRhYmluZGV4ITogbnVtYmVyIHwgbnVsbDtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdidXR0b24nO1xuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdGhpcy5kaXNhYmxlZCA/IG51bGwgOiAwO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVLZXlkb3duIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IEVudGVyIHx8IGV2ZW50LmtleSA9PT0gU3BhY2UpIHtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCwgVGVtcGxhdGVSZXN1bHQgfSBmcm9tICdsaXQtaHRtbCc7XG5pbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSAnLi4vLi4vLi4vc3JjL2RlY29yYXRvcnMvdXRpbHMvc3RyaW5nLXV0aWxzJztcblxuZXhwb3J0IHR5cGUgQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKSA9PiBUZW1wbGF0ZVJlc3VsdDtcblxuZXhwb3J0IGNvbnN0IGNvcHlyaWdodDogQ29weXJpZ2h0SGVscGVyID0gKGRhdGU6IERhdGUsIGF1dGhvcjogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHQgPT4ge1xuXG4gICAgcmV0dXJuIGh0bWxgJmNvcHk7IENvcHlyaWdodCAkeyBkYXRlLmdldEZ1bGxZZWFyKCkgfSAkeyBhdXRob3IudHJpbSgpIH1gO1xufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyQm9vbGVhbiwgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGh0bWwsIHByb3BlcnR5LCBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIgfSBmcm9tICcuLi8uLi8uLi9zcmMnO1xuaW1wb3J0IHsgY29weXJpZ2h0LCBDb3B5cmlnaHRIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2NvcHlyaWdodCc7XG5pbXBvcnQgeyBBY2NvcmRpb25IZWFkZXIgfSBmcm9tICcuL2FjY29yZGlvbi1oZWFkZXInO1xuaW1wb3J0IHsgY3NzIH0gZnJvbSAnLi4vLi4vLi4vc3JjL2Nzcyc7XG5cbmxldCBuZXh0QWNjb3JkaW9uUGFuZWxJZCA9IDA7XG5cbkBjb21wb25lbnQ8QWNjb3JkaW9uUGFuZWw+KHtcbiAgICBzZWxlY3RvcjogJ3VpLWFjY29yZGlvbi1wYW5lbCcsXG4gICAgc3R5bGVzOiBbY3NzYFxuICAgIDpob3N0IHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gICAgOmhvc3QgPiAudWktYWNjb3JkaW9uLWhlYWRlciB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgIH1cbiAgICA6aG9zdCA+IC51aS1hY2NvcmRpb24tYm9keSB7XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgICAgIHRyYW5zaXRpb246IGhlaWdodCAuMnMgZWFzZS1vdXQ7XG4gICAgfVxuICAgIDpob3N0ID4gLnVpLWFjY29yZGlvbi1ib2R5W2FyaWEtaGlkZGVuPXRydWVdIHtcbiAgICAgICAgaGVpZ2h0OiAwO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIH1cbiAgICAuY29weXJpZ2h0IHtcbiAgICAgICAgcGFkZGluZzogMCAxcmVtIDFyZW07XG4gICAgICAgIGNvbG9yOiB2YXIoLS1kaXNhYmxlZC1jb2xvciwgJyNjY2MnKTtcbiAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKHBhbmVsLCBjb3B5cmlnaHQ6IENvcHlyaWdodEhlbHBlcikgPT4gaHRtbGBcbiAgICA8ZGl2IGNsYXNzPVwidWktYWNjb3JkaW9uLWhlYWRlclwiXG4gICAgICAgIHJvbGU9XCJoZWFkaW5nXCJcbiAgICAgICAgYXJpYS1sZXZlbD1cIiR7IHBhbmVsLmxldmVsIH1cIlxuICAgICAgICBAY2xpY2s9JHsgcGFuZWwudG9nZ2xlIH0+XG4gICAgICAgIDxzbG90IG5hbWU9XCJoZWFkZXJcIj48L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInVpLWFjY29yZGlvbi1ib2R5XCJcbiAgICAgICAgaWQ9XCIkeyBwYW5lbC5pZCB9LWJvZHlcIlxuICAgICAgICBzdHlsZT1cImhlaWdodDogJHsgcGFuZWwuY29udGVudEhlaWdodCB9O1wiXG4gICAgICAgIHJvbGU9XCJyZWdpb25cIlxuICAgICAgICBhcmlhLWhpZGRlbj1cIiR7ICFwYW5lbC5leHBhbmRlZCB9XCJcbiAgICAgICAgYXJpYS1sYWJlbGxlZGJ5PVwiJHsgcGFuZWwuaWQgfS1oZWFkZXJcIj5cbiAgICAgICAgPHNsb3Q+PC9zbG90PlxuICAgICAgICA8c3BhbiBjbGFzcz1cImNvcHlyaWdodFwiPiR7IGNvcHlyaWdodChuZXcgRGF0ZSgpLCAnQWxleGFuZGVyIFdlbmRlJykgfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjY29yZGlvblBhbmVsIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIHByb3RlY3RlZCBfaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsID0gbnVsbDtcbiAgICBwcm90ZWN0ZWQgX2JvZHk6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IGNvbnRlbnRIZWlnaHQgKCk6IHN0cmluZyB7XG5cbiAgICAgICAgcmV0dXJuICF0aGlzLmV4cGFuZGVkID9cbiAgICAgICAgICAgICcwcHgnIDpcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgP1xuICAgICAgICAgICAgICAgIGAkeyB0aGlzLl9ib2R5LnNjcm9sbEhlaWdodCB9cHhgIDpcbiAgICAgICAgICAgICAgICAnYXV0byc7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXJcbiAgICB9KVxuICAgIGxldmVsID0gMTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZXhwYW5kZWQgPSBmYWxzZTtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyQm9vbGVhblxuICAgIH0pXG4gICAgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yICgpIHtcblxuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IGB1aS1hY2NvcmRpb24tcGFuZWwtJHsgbmV4dEFjY29yZGlvblBhbmVsSWQrKyB9YDtcbiAgICB9XG5cbiAgICB0b2dnbGUgKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gd3JhcHBpbmcgdGhlIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgd2F0Y2ggbWV0aG9kIHdpbGwgZGlzcGF0Y2ggYSBwcm9wZXJ0eSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB7XG5cbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9oZWFkZXIpIHRoaXMuX2hlYWRlci5leHBhbmRlZCA9IHRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMuc2V0SGVhZGVyKHRoaXMucXVlcnlTZWxlY3RvcigndWktYWNjb3JkaW9uLWhlYWRlcicpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHVwZGF0ZSwgd2UgcXVlcnkgdGhlIGFjY29yZGlvbi1wYW5lbC1ib2R5XG4gICAgICAgICAgICB0aGlzLl9ib2R5ID0gdGhpcy5yZW5kZXJSb290LnF1ZXJ5U2VsZWN0b3IoYCMkeyB0aGlzLmlkIH0tYm9keWApO1xuXG4gICAgICAgICAgICAvLyBoYXZpbmcgcXVlcmllZCB0aGUgYWNjb3JkaW9uLXBhbmVsLWJvZHksIHtAbGluayBjb250ZW50SGVpZ2h0fSBjYW4gbm93IGNhbGN1bGF0ZSB0aGVcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaGVpZ2h0IG9mIHRoZSBwYW5lbCBib2R5IGZvciBhbmltYXRpb25cbiAgICAgICAgICAgIC8vIGluIG9yZGVyIHRvIHJlLWV2YWx1YXRlIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIGZvciB7QGxpbmsgY29udGVudEhlaWdodH0gd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gdHJpZ2dlciBhbm90aGVyIHJlbmRlciAodGhpcyBpcyBjaGVhcCwgb25seSBjb250ZW50SGVpZ2h0IGhhcyBjaGFuZ2VkIGFuZCB3aWxsIGJlIHVwZGF0ZWQpXG4gICAgICAgICAgICAvLyBob3dldmVyIHdlIGNhbm5vdCByZXF1ZXN0IGFub3RoZXIgdXBkYXRlIHdoaWxlIHdlIGFyZSBzdGlsbCBpbiB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGVcbiAgICAgICAgICAgIC8vIHVzaW5nIGEgUHJvbWlzZSwgd2UgY2FuIGRlZmVyIHJlcXVlc3RpbmcgdGhlIHVwZGF0ZSB1bnRpbCBhZnRlciB0aGUgY3VycmVudCB1cGRhdGUgaXMgZG9uZVxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHRydWUpLnRoZW4oKCkgPT4gdGhpcy5yZXF1ZXN0VXBkYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIHJlbmRlciBtZXRob2QgdG8gaW5qZWN0IGN1c3RvbSBoZWxwZXJzIGludG8gdGhlIHRlbXBsYXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbmRlciAoKSB7XG5cbiAgICAgICAgc3VwZXIucmVuZGVyKGNvcHlyaWdodCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNldEhlYWRlciAoaGVhZGVyOiBBY2NvcmRpb25IZWFkZXIgfCBudWxsKSB7XG5cbiAgICAgICAgdGhpcy5faGVhZGVyID0gaGVhZGVyO1xuXG4gICAgICAgIGlmICghaGVhZGVyKSByZXR1cm47XG5cbiAgICAgICAgaGVhZGVyLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdoZWFkZXInKTtcblxuICAgICAgICBoZWFkZXIuaWQgPSBoZWFkZXIuaWQgfHwgYCR7IHRoaXMuaWQgfS1oZWFkZXJgO1xuICAgICAgICBoZWFkZXIuY29udHJvbHMgPSBgJHsgdGhpcy5pZCB9LWJvZHlgO1xuICAgICAgICBoZWFkZXIuZXhwYW5kZWQgPSB0aGlzLmV4cGFuZGVkO1xuICAgICAgICBoZWFkZXIuZGlzYWJsZWQgPSB0aGlzLmRpc2FibGVkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBodG1sLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9zcmMnO1xuaW1wb3J0IHsgY3NzIH0gZnJvbSAnLi4vLi4vLi4vc3JjL2Nzcyc7XG5pbXBvcnQgeyBGb2N1c0tleU1hbmFnZXIgfSBmcm9tICcuLi9saXN0LWtleS1tYW5hZ2VyJztcbmltcG9ydCAnLi9hY2NvcmRpb24taGVhZGVyJztcbmltcG9ydCB7IEFjY29yZGlvbkhlYWRlciB9IGZyb20gJy4vYWNjb3JkaW9uLWhlYWRlcic7XG5pbXBvcnQgJy4vYWNjb3JkaW9uLXBhbmVsJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS1hY2NvcmRpb24nLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICAgIGJhY2tncm91bmQtY2xpcDogYm9yZGVyLWJveDtcbiAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pO1xuICAgIH1cbiAgICBgXSxcbiAgICB0ZW1wbGF0ZTogKCkgPT4gaHRtbGBcbiAgICA8c2xvdD48L3Nsb3Q+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBBY2NvcmRpb24gZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJvdGVjdGVkIGZvY3VzTWFuYWdlciE6IEZvY3VzS2V5TWFuYWdlcjxBY2NvcmRpb25IZWFkZXI+O1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgcmVmbGVjdEF0dHJpYnV0ZTogZmFsc2VcbiAgICB9KVxuICAgIHJvbGUgPSAncHJlc2VudGF0aW9uJztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICdwcmVzZW50YXRpb24nO1xuXG4gICAgICAgIHRoaXMuZm9jdXNNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLCB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ3VpLWFjY29yZGlvbi1oZWFkZXInKSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgaHRtbCB9IGZyb20gJ2xpdC1odG1sJztcbmltcG9ydCB7IEFwcCB9IGZyb20gJy4vYXBwJztcblxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlID0gKGVsZW1lbnQ6IEFwcCkgPT4gaHRtbGBcbiAgICA8aGVhZGVyPlxuICAgICAgICA8aDE+RXhhbXBsZXM8L2gxPlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPG1haW4+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMj5JY29uPC9oMj5cblxuICAgICAgICAgICAgPGgzPkZvbnQgQXdlc29tZTwvaDM+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uc1wiPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGV2cm9uLXJpZ2h0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZW52ZWxvcGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jay1vcGVuJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAncGFpbnQtYnJ1c2gnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW4nIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3RpbWVzJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gtYWx0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnZXhjbGFtYXRpb24tdHJpYW5nbGUnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdpbmZvLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uLWNpcmNsZScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3VzZXItY2lyY2xlJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAndGltZXMnIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPlVuaWNvbnM8L2gzPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbnNcIj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYW5nbGUtcmlnaHQtYicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZS1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbG9jaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnYnJ1c2gtYWx0JyB9IC5zZXQ9JHsgJ3VuaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3BlbicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd0cmFzaC1hbHQnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlci1jaXJjbGUnIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmc8dWktaWNvbiAuaWNvbj0keyAnY2hlY2snIH0gLnNldD0keyAndW5pJyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPkJ1eSBzb21ldGhpbmcgZWxzZTx1aS1pY29uIC5pY29uPSR7ICd0aW1lcycgfSAuc2V0PSR7ICd1bmknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgzPk1hdGVyaWFsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb25fcmlnaHQnIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnbWFpbCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdsb2NrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2tfb3BlbicgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdicnVzaCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlZGl0JyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NsZWFyJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2RlbGV0ZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd3YXJuaW5nJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2luZm8nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAnaGVscCcgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdhY2NvdW50X2NpcmNsZScgfSAuc2V0PSR7ICdtYXQnIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZXJzb24nIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nPHVpLWljb24gLmljb249JHsgJ2NoZWNrJyB9IC5zZXQ9JHsgJ21hdCcgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xlYXInIH0gLnNldD0keyAnbWF0JyB9PjwvdWktaWNvbj48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG5cbiAgICAgICAgICAgIDxoMz5FdmlsIEljb25zPC9oMz5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb25zXCI+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2NoZXZyb24tcmlnaHQnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdlbnZlbG9wZScgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2xvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICd1bmxvY2snIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwYXBlcmNsaXAnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdwZW5jaWwnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ2Nsb3NlJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndHJhc2gnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPlxuICAgICAgICAgICAgICAgIDx1aS1pY29uIC5pY29uPSR7ICdleGNsYW1hdGlvbicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICAgICAgPHVpLWljb24gLmljb249JHsgJ3F1ZXN0aW9uJyB9IC5zZXQ9JHsgJ2VpJyB9PjwvdWktaWNvbj5cbiAgICAgICAgICAgICAgICA8dWktaWNvbiAuaWNvbj0keyAndXNlcicgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+QnV5IHNvbWV0aGluZzx1aS1pY29uIC5pY29uPSR7ICdjaGVjaycgfSAuc2V0PSR7ICdlaScgfT48L3VpLWljb24+PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj5CdXkgc29tZXRoaW5nIGVsc2U8dWktaWNvbiAuaWNvbj0keyAnY2xvc2UnIH0gLnNldD0keyAnZWknIH0+PC91aS1pY29uPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPC91bD5cblxuICAgICAgICAgICAgPGgyPkNoZWNrYm94PC9oMj5cbiAgICAgICAgICAgIDx1aS1jaGVja2JveCAuY2hlY2tlZD0keyB0cnVlIH0+PC91aS1jaGVja2JveD5cblxuICAgICAgICAgICAgPGgyPlRvZ2dsZTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1lbWFpbFwiPk5vdGlmaWNhdGlvbiBlbWFpbDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHVpLXRvZ2dsZSBsYWJlbC1vbj1cInllc1wiIGxhYmVsLW9mZj1cIm5vXCIgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5LWVtYWlsXCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeS1zbXNcIj5Ob3RpZmljYXRpb24gc21zPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dWktdG9nZ2xlIGxhYmVsLW9uPVwieWVzXCIgbGFiZWwtb2ZmPVwibm9cIiBhcmlhLWxhYmVsbGVkYnk9XCJub3RpZnktc21zXCI+PC91aS10b2dnbGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJzZXR0aW5ncy1saXN0XCI+XG4gICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm5vdGlmeVwiPk5vdGlmaWNhdGlvbnM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx1aS10b2dnbGUgYXJpYS1sYWJlbGxlZGJ5PVwibm90aWZ5XCIgYXJpYS1jaGVja2VkPVwidHJ1ZVwiPjwvdWktdG9nZ2xlPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyPkNhcmQ8L2gyPlxuICAgICAgICAgICAgPHVpLWNhcmQ+XG4gICAgICAgICAgICAgICAgPGgzIHNsb3Q9XCJ1aS1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1jYXJkLWJvZHlcIj5DYXJkIGJvZHkgdGV4dC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1mb290ZXJcIj5DYXJkIGZvb3RlcjwvcD5cbiAgICAgICAgICAgIDwvdWktY2FyZD5cblxuICAgICAgICAgICAgPGgyPkFjdGlvbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1hY3Rpb24tY2FyZD5cbiAgICAgICAgICAgICAgICA8aDMgc2xvdD1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPkNhcmQgVGl0bGU8L2gzPlxuICAgICAgICAgICAgICAgIDxwIHNsb3Q9XCJ1aS1hY3Rpb24tY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBzbG90PVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPk1vcmU8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdWktYWN0aW9uLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5QbGFpbiBDYXJkPC9oMj5cbiAgICAgICAgICAgIDx1aS1wbGFpbi1jYXJkPlxuICAgICAgICAgICAgICAgIDxoMyBzbG90PVwidWktY2FyZC1oZWFkZXJcIj5DYXJkIFRpdGxlPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBzbG90PVwidWktY2FyZC1ib2R5XCI+Q2FyZCBib2R5IHRleHQuLi48L3A+XG4gICAgICAgICAgICAgICAgPHAgc2xvdD1cInVpLWNhcmQtZm9vdGVyXCI+Q2FyZCBmb290ZXI8L3A+XG4gICAgICAgICAgICA8L3VpLXBsYWluLWNhcmQ+XG5cbiAgICAgICAgICAgIDxoMj5UYWJzPC9oMj5cbiAgICAgICAgICAgIDx1aS10YWItbGlzdD5cbiAgICAgICAgICAgICAgICA8dWktdGFiIGlkPVwidGFiLTFcIiBhcmlhLWNvbnRyb2xzPVwidGFiLXBhbmVsLTFcIj48c3Bhbj5GaXJzdCBUYWI8L3NwYW4+PC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi0yXCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC0yXCI+U2Vjb25kIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgICAgIDx1aS10YWIgaWQ9XCJ0YWItM1wiIGFyaWEtY29udHJvbHM9XCJ0YWItcGFuZWwtM1wiIGFyaWEtZGlzYWJsZWQ9XCJ0cnVlXCI+VGhpcmQgVGFiPC91aS10YWI+XG4gICAgICAgICAgICAgICAgPHVpLXRhYiBpZD1cInRhYi00XCIgYXJpYS1jb250cm9scz1cInRhYi1wYW5lbC00XCI+Rm91cnRoIFRhYjwvdWktdGFiPlxuICAgICAgICAgICAgPC91aS10YWItbGlzdD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtMVwiPlxuICAgICAgICAgICAgICAgIDxoMz5GaXJzdCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBubyBwcmltYSBxdWFsaXNxdWUgZXVyaXBpZGlzIGVzdC4gUXVhbGlzcXVlIHF1YWVyZW5kdW0gYXQgZXN0LiBMYXVkZW1cbiAgICAgICAgICAgICAgICAgICAgY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3RybyByZWN1c2FibyBhblxuICAgICAgICAgICAgICAgICAgICBlc3QsIHdpc2kgc3VtbW8gbmVjZXNzaXRhdGlidXMgY3VtIG5lLjwvcD5cbiAgICAgICAgICAgIDwvdWktdGFiLXBhbmVsPlxuICAgICAgICAgICAgPHVpLXRhYi1wYW5lbCBpZD1cInRhYi1wYW5lbC0yXCI+XG4gICAgICAgICAgICAgICAgPGgzPlNlY29uZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkluIGNsaXRhIHRvbGxpdCBtaW5pbXVtIHF1bywgYW4gYWNjdXNhdGEgdm9sdXRwYXQgZXVyaXBpZGlzIHZpbS4gRmVycmkgcXVpZGFtIGRlbGVuaXRpIHF1byBlYSwgZHVvXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWUgY2V0ZXJvc1xuICAgICAgICAgICAgICAgICAgICBlbGVpZmVuZC4gRXggbWVsIHBsYXRvbmVtIGFzc2VudGlvciBwZXJzZXF1ZXJpcywgdml4IGNpYm8gbGlicmlzIHV0LiBBZCB0aW1lYW0gYWNjdW1zYW4gZXN0LCBldCBhdXRlbVxuICAgICAgICAgICAgICAgICAgICBvbW5lcyBjaXZpYnVzIG1lbC4gTWVsIGV1IHViaXF1ZSBlcXVpZGVtIG1vbGVzdGlhZSwgY2hvcm8gZG9jZW5kaSBtb2RlcmF0aXVzIGVpIG5hbS48L3A+XG4gICAgICAgICAgICA8L3VpLXRhYi1wYW5lbD5cbiAgICAgICAgICAgIDx1aS10YWItcGFuZWwgaWQ9XCJ0YWItcGFuZWwtM1wiPlxuICAgICAgICAgICAgICAgIDxoMz5UaGlyZCBUYWIgUGFuZWw8L2gzPlxuICAgICAgICAgICAgICAgIDxwPkknbSBkaXNhYmxlZCwgeW91IHNob3VsZG4ndCBzZWUgbWUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgICAgICA8dWktdGFiLXBhbmVsIGlkPVwidGFiLXBhbmVsLTRcIj5cbiAgICAgICAgICAgICAgICA8aDM+Rm91cnRoIFRhYiBQYW5lbDwvaDM+XG4gICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuIExhdWRlbVxuICAgICAgICAgICAgICAgICAgICBjb25zdGl0dWFtIGVhIHVzdSwgdmlydHV0ZSBwb25kZXJ1bSBwb3NpZG9uaXVtIG5vIGVvcy4gRG9sb3JlcyBjb25zZXRldHVyIGV4IGhhcy4gTm9zdHJvIHJlY3VzYWJvIGFuXG4gICAgICAgICAgICAgICAgICAgIGVzdCwgd2lzaSBzdW1tbyBuZWNlc3NpdGF0aWJ1cyBjdW0gbmUuPC9wPlxuICAgICAgICAgICAgPC91aS10YWItcGFuZWw+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDI+QWNjb3JkaW9uPC9oMj5cblxuICAgICAgICAgICAgPHVpLWFjY29yZGlvbj5cblxuICAgICAgICAgICAgICAgIDx1aS1hY2NvcmRpb24tcGFuZWwgaWQ9XCJjdXN0b20tcGFuZWwtaWRcIiBleHBhbmRlZCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBPbmU8L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIG5vIHByaW1hIHF1YWxpc3F1ZSBldXJpcGlkaXMgZXN0LiBRdWFsaXNxdWUgcXVhZXJlbmR1bSBhdCBlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICBMYXVkZW0gY29uc3RpdHVhbSBlYSB1c3UsIHZpcnR1dGUgcG9uZGVydW0gcG9zaWRvbml1bSBubyBlb3MuIERvbG9yZXMgY29uc2V0ZXR1ciBleCBoYXMuIE5vc3Ryb1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdXNhYm8gYW4gZXN0LCB3aXNpIHN1bW1vIG5lY2Vzc2l0YXRpYnVzIGN1bSBuZS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPkF0IHVzdSBlcGljdXJlaSBhc3NlbnRpb3IsIHB1dGVudCBkaXNzZW50aWV0IHJlcHVkaWFuZGFlIGVhIHF1by4gUHJvIG5lIGRlYml0aXMgcGxhY2VyYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25pZmVydW1xdWUsIGluIHNvbmV0IHZvbHVtdXMgaW50ZXJwcmV0YXJpcyBjdW0uIERvbG9ydW0gYXBwZXRlcmUgbmUgcXVvLiBEaWN0YSBxdWFsaXNxdWUgZW9zXG4gICAgICAgICAgICAgICAgICAgICAgICBlYSwgZWFtIGF0IG51bGxhIHRhbXF1YW0uXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICAgICAgPHVpLWFjY29yZGlvbi1wYW5lbCBsZXZlbD1cIjNcIj5cblxuICAgICAgICAgICAgICAgICAgICA8dWktYWNjb3JkaW9uLWhlYWRlcj5QYW5lbCBUd288L3VpLWFjY29yZGlvbi1oZWFkZXI+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+SW4gY2xpdGEgdG9sbGl0IG1pbmltdW0gcXVvLCBhbiBhY2N1c2F0YSB2b2x1dHBhdCBldXJpcGlkaXMgdmltLiBGZXJyaSBxdWlkYW0gZGVsZW5pdGkgcXVvIGVhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVvIGFuaW1hbCBhY2N1c2FtdXMgZXUsIGNpYm8gZXJyb3JpYnVzIGV0IG1lYS4gRXggZWFtIHdpc2kgYWRtb2R1bSBwcmFlc2VudCwgaGFzIGN1IG9ibGlxdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNldGVyb3MgZWxlaWZlbmQuIEV4IG1lbCBwbGF0b25lbSBhc3NlbnRpb3IgcGVyc2VxdWVyaXMsIHZpeCBjaWJvIGxpYnJpcyB1dC4gQWQgdGltZWFtIGFjY3Vtc2FuXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3QsIGV0IGF1dGVtIG9tbmVzIGNpdmlidXMgbWVsLiBNZWwgZXUgdWJpcXVlIGVxdWlkZW0gbW9sZXN0aWFlLCBjaG9ybyBkb2NlbmRpIG1vZGVyYXRpdXMgZWlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbS48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPlF1aSBzdWFzIHNvbGV0IGNldGVyb3MgY3UsIHBlcnRpbmF4IHZ1bHB1dGF0ZSBkZXRlcnJ1aXNzZXQgZW9zIG5lLiBOZSBpdXMgdmlkZSBudWxsYW0sIGFsaWVudW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFlIHJlZm9ybWlkYW5zIGN1bSBhZC4gRWEgbWVsaW9yZSBzYXBpZW50ZW0gaW50ZXJwcmV0YXJpcyBlYW0uIENvbW11bmUgZGVsaWNhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHVkaWFuZGFlIGluIGVvcywgcGxhY2VyYXQgaW5jb3JydXB0ZSBkZWZpbml0aW9uZXMgbmVjIGV4LiBDdSBlbGl0ciB0YW50YXMgaW5zdHJ1Y3Rpb3Igc2l0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXUgZXVtIGFsaWEgZ3JhZWNlIG5lZ2xlZ2VudHVyLjwvcD5cblxuICAgICAgICAgICAgICAgIDwvdWktYWNjb3JkaW9uLXBhbmVsPlxuXG4gICAgICAgICAgICA8L3VpLWFjY29yZGlvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICA8L21haW4+XG4gICAgYDtcbiIsImltcG9ydCB7IENvbXBvbmVudCwgY29tcG9uZW50LCBodG1sLCBsaXN0ZW5lciwgcHJvcGVydHkgfSBmcm9tICcuLi8uLi9zcmMnO1xuaW1wb3J0IHsgY3NzIH0gZnJvbSAnLi4vLi4vc3JjL2Nzcyc7XG5cbi8vIHdlIGNhbiBkZWZpbmUgbWl4aW5zIGFzXG5jb25zdCBtaXhpbkNvbnRhaW5lcjogKGJhY2tncm91bmQ/OiBzdHJpbmcpID0+IHN0cmluZyA9IChiYWNrZ3JvdW5kOiBzdHJpbmcgPSAnI2ZmZicpID0+IGNzc2BcbiAgICBiYWNrZ3JvdW5kOiAkeyBiYWNrZ3JvdW5kIH07XG4gICAgYmFja2dyb3VuZC1jbGlwOiBib3JkZXItYm94O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG5gO1xuXG5jb25zdCBzdHlsZSA9IGNzc2Bcbjpob3N0IHtcbiAgICAtLW1heC13aWR0aDogNDBjaDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZmxvdzogY29sdW1uO1xuICAgIG1heC13aWR0aDogdmFyKC0tbWF4LXdpZHRoKTtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIC8qIHdlIGNhbiBhcHBseSBtaXhpbnMgd2l0aCBzcHJlYWQgc3ludGF4ICovXG4gICAgJHsgbWl4aW5Db250YWluZXIoKSB9XG59XG46OnNsb3R0ZWQoKikge1xuICAgIG1hcmdpbjogMDtcbn1cbmA7XG5cbkBjb21wb25lbnQ8Q2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2FyZCcsXG4gICAgc3R5bGVzOiBbc3R5bGVdLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtaGVhZGVyXCI+PC9zbG90PlxuICAgIDxzbG90IG5hbWU9XCJ1aS1jYXJkLWJvZHlcIj48L3Nsb3Q+XG4gICAgPHNsb3QgbmFtZT1cInVpLWNhcmQtZm9vdGVyXCI+PC9zbG90PlxuICAgIDxkaXY+V29ya2VyIGNvdW50ZXI6ICR7IGNhcmQuY291bnRlciB9PC9kaXY+XG4gICAgPGJ1dHRvbj5TdG9wIHdvcmtlcjwvYnV0dG9uPlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgQ2FyZCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBhdHRyaWJ1dGU6IGZhbHNlXG4gICAgfSlcbiAgICBjb3VudGVyITogbnVtYmVyO1xuXG4gICAgd29ya2VyITogV29ya2VyO1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKCd3b3JrZXIuanMnKTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuZGlzY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgICAgdGFyZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnJlbmRlclJvb3QucXVlcnlTZWxlY3RvcignYnV0dG9uJykhOyB9XG4gICAgfSlcbiAgICBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXI8Q2FyZD4oe1xuICAgICAgICBldmVudDogJ21lc3NhZ2UnLFxuICAgICAgICB0YXJnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud29ya2VyOyB9XG4gICAgfSlcbiAgICBoYW5kbGVNZXNzYWdlIChldmVudDogTWVzc2FnZUV2ZW50KSB7XG5cbiAgICAgICAgdGhpcy53YXRjaCgoKSA9PiB0aGlzLmNvdW50ZXIgPSBldmVudC5kYXRhKTtcbiAgICB9XG59XG5cbkBjb21wb25lbnQ8QWN0aW9uQ2FyZD4oe1xuICAgIHNlbGVjdG9yOiAndWktYWN0aW9uLWNhcmQnLFxuICAgIHRlbXBsYXRlOiBjYXJkID0+IGh0bWxgXG4gICAgPHNsb3QgbmFtZT1cInVpLWFjdGlvbi1jYXJkLWhlYWRlclwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYm9keVwiPjwvc2xvdD5cbiAgICA8c2xvdCBuYW1lPVwidWktYWN0aW9uLWNhcmQtYWN0aW9uc1wiPjwvc2xvdD5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIEFjdGlvbkNhcmQgZXh0ZW5kcyBDYXJkIHtcblxuICAgIC8vIHdlIGNhbiBpbmhlcml0IHN0eWxlcyBleHBsaWNpdGx5XG4gICAgc3RhdGljIGdldCBzdHlsZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgLi4uc3VwZXIuc3R5bGVzLFxuICAgICAgICAgICAgJ3Nsb3RbbmFtZT11aS1hY3Rpb24tY2FyZC1hY3Rpb25zXSB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiByaWdodDsgfSdcbiAgICAgICAgXVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiBudWxsIH0pXG4gICAgaGFuZGxlQ2xpY2sgKCkgeyB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogbnVsbCB9KVxuICAgIGhhbmRsZU1lc3NhZ2UgKCkgeyB9XG59XG5cbkBjb21wb25lbnQ8UGxhaW5DYXJkPih7XG4gICAgc2VsZWN0b3I6ICd1aS1wbGFpbi1jYXJkJyxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYDpob3N0IHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbWF4LXdpZHRoOiA0MGNoO1xuICAgICAgICB9YFxuICAgIF1cbiAgICAvLyBpZiB3ZSBkb24ndCBzcGVjaWZ5IGEgdGVtcGxhdGUsIGl0IHdpbGwgYmUgaW5oZXJpdGVkXG59KVxuZXhwb3J0IGNsYXNzIFBsYWluQ2FyZCBleHRlbmRzIENhcmQgeyB9XG4iLCJpbXBvcnQgeyBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLCBjb21wb25lbnQsIENvbXBvbmVudCwgaHRtbCwgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCB7IGNzcyB9IGZyb20gJy4uLy4uL3NyYy9jc3MnO1xuaW1wb3J0IHsgRW50ZXIsIFNwYWNlIH0gZnJvbSAnLi9rZXlzJztcblxuQGNvbXBvbmVudDxDaGVja2JveD4oe1xuICAgIHNlbGVjdG9yOiAndWktY2hlY2tib3gnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIHdpZHRoOiAxcmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAxcmVtO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsICNiZmJmYmYpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSk7XG4gICAgICAgICAgICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFthcmlhLWNoZWNrZWQ9XCJ0cnVlXCJdKSB7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCAjYmZiZmJmKTtcbiAgICAgICAgfVxuICAgICAgICAuY2hlY2stbWFyayB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDAuMjVyZW07XG4gICAgICAgICAgICBsZWZ0OiAwLjEyNXJlbTtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgd2lkdGg6IDAuNjI1cmVtO1xuICAgICAgICAgICAgaGVpZ2h0OiAwLjI1cmVtO1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMCAwIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pIHZhcigtLWJvcmRlci13aWR0aCwgMC4xMjVyZW0pO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoLTQ1ZGVnKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IC4xcyBlYXNlLWluO1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmNoZWNrLW1hcmsge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiBjaGVja2JveCA9PiBodG1sYFxuICAgIDxzcGFuIGNsYXNzPVwiY2hlY2stbWFya1wiPjwvc3Bhbj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgIC8vIENocm9tZSBhbHJlYWR5IHJlZmxlY3RzIGFyaWEgcHJvcGVydGllcywgYnV0IEZpcmVmb3ggZG9lc24ndCwgc28gd2UgbmVlZCBhIHByb3BlcnR5IGRlY29yYXRvclxuICAgIC8vIGhvd2V2ZXIsIHdlIGNhbm5vdCBpbml0aWFsaXplIHJvbGUgd2l0aCBhIHZhbHVlIGhlcmUsIGFzIENocm9tZSdzIHJlZmxlY3Rpb24gd2lsbCBjYXVzZSBhblxuICAgIC8vIGF0dHJpYnV0ZSBjaGFuZ2UgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCB0aGF0IHdpbGwgdGhyb3cgYW4gZXJyb3JcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL2FyaWEvaXNzdWVzLzY5MVxuICAgIEBwcm9wZXJ0eSgpXG4gICAgcm9sZSE6IHN0cmluZztcblxuICAgIEBwcm9wZXJ0eTxDaGVja2JveD4oe1xuICAgICAgICAvLyB0aGUgY29udmVydGVyIHdpbGwgYmUgdXNlZCB0byByZWZsZWN0IGZyb20gdGhlIGNoZWNrZWQgYXR0cmlidXRlIHRvIHRoZSBwcm9wZXJ0eSwgYnV0IG5vdFxuICAgICAgICAvLyB0aGUgb3RoZXIgd2F5IGFyb3VuZCwgYXMgd2UgZGVmaW5lIGEgY3VzdG9tIHtAbGluayBQcm9wZXJ0eVJlZmxlY3Rvcn1cbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJCb29sZWFuLFxuICAgICAgICAvLyB3ZSBjYW4gdXNlIGEge0BsaW5rIFByb3BlcnR5UmVmbGVjdG9yfSB0byByZWZsZWN0IHRvIG11bHRpcGxlIGF0dHJpYnV0ZXMgaW4gZGlmZmVyZW50IHdheXNcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCBvbGRWYWx1ZTogYW55LCBuZXdWYWx1ZTogYW55KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtY2hlY2tlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBjaGVja2VkID0gZmFsc2U7XG5cbiAgICBAbGlzdGVuZXIoe1xuICAgICAgICBldmVudDogJ2NsaWNrJ1xuICAgIH0pXG4gICAgdG9nZ2xlICgpIHtcblxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgLy8gVE9ETzogRG9jdW1lbnQgdGhpcyB1c2UgY2FzZSFcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY3VzdG9tLWVsZW1lbnRzLmh0bWwjY3VzdG9tLWVsZW1lbnQtY29uZm9ybWFuY2VcbiAgICAgICAgLy8gSFRNTEVsZW1lbnQgaGFzIGEgc2V0dGVyIGFuZCBnZXR0ZXIgZm9yIHRhYkluZGV4LCB3ZSBkb24ndCBuZWVkIGEgcHJvcGVydHkgZGVjb3JhdG9yIHRvIHJlZmxlY3QgaXRcbiAgICAgICAgLy8gd2UgYXJlIG5vdCBhbGxvd2VkIHRvIHNldCBpdCBpbiB0aGUgY29uc3RydWN0b3IgdGhvdWdoLCBhcyBpdCBjcmVhdGVzIGEgcmVmbGVjdGVkIGF0dHJpYnV0ZSwgd2hpY2hcbiAgICAgICAgLy8gY2F1c2VzIGFuIGVycm9yXG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAwO1xuXG4gICAgICAgIC8vIHdlIGluaXRpYWxpemUgcm9sZSBpbiB0aGUgY29ubmVjdGVkQ2FsbGJhY2sgYXMgd2VsbCwgdG8gcHJldmVudCBDaHJvbWUgZnJvbSByZWZsZWN0aW5nIGVhcmx5XG4gICAgICAgIHRoaXMucm9sZSA9ICdjaGVja2JveCc7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBBdHRyaWJ1dGVDb252ZXJ0ZXJOdW1iZXIsXG4gICAgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIENoYW5nZXMsXG4gICAgQ29tcG9uZW50LFxuICAgIGNvbXBvbmVudCxcbiAgICBodG1sLFxuICAgIGxpc3RlbmVyLFxuICAgIHByb3BlcnR5XG59IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBjc3MgfSBmcm9tICcuLi8uLi8uLi9zcmMvY3NzJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi4vYXJpYS1ib29sZWFuLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBUYWJQYW5lbCB9IGZyb20gJy4vdGFiLXBhbmVsJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd1aS10YWInLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93O1xuICAgICAgICBwYWRkaW5nOiAwLjVyZW0gMC41cmVtO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGJvcmRlcjogdmFyKC0tYm9yZGVyKTtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgMCAwO1xuICAgICAgICBib3gtc2hhZG93OiB2YXIoLS1ib3gtc2hhZG93KTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG4gICAgfVxuICAgIDpob3N0KFthcmlhLXNlbGVjdGVkPXRydWVdKTphZnRlciB7XG4gICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB6LWluZGV4OiAyO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICBib3R0b206IGNhbGMoLTEgKiB2YXIoLS1ib3JkZXItd2lkdGgpKTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1ib3JkZXItd2lkdGgpICsgMC41cmVtKTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYiBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgICBwcml2YXRlIF9wYW5lbDogVGFiUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgX3NlbGVjdGVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jb250cm9scycsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgY29udHJvbHMhOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBXZSBwcm92aWRlIG91ciBvd24gdGFiaW5kZXggcHJvcGVydHksIHNvIHdlIGNhbiBzZXQgaXQgdG8gYG51bGxgXG4gICAgICogdG8gcmVtb3ZlIHRoZSB0YWJpbmRleC1hdHRyaWJ1dGUuXG4gICAgICovXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAndGFiaW5kZXgnLFxuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlck51bWJlclxuICAgIH0pXG4gICAgdGFiaW5kZXghOiBudW1iZXIgfCBudWxsO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1zZWxlY3RlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQVJJQUJvb2xlYW5Db252ZXJ0ZXJcbiAgICB9KVxuICAgIGdldCBzZWxlY3RlZCAoKTogYm9vbGVhbiB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICAgIH1cblxuICAgIHNldCBzZWxlY3RlZCAodmFsdWU6IGJvb2xlYW4pIHtcblxuICAgICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuXG4gICAgICAgIHRoaXMudGFiaW5kZXggPSB0aGlzLmRpc2FibGVkID8gbnVsbCA6ICh2YWx1ZSA/IDAgOiAtMSk7XG4gICAgfVxuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1kaXNhYmxlZCcsXG4gICAgICAgIGNvbnZlcnRlcjogQVJJQUJvb2xlYW5Db252ZXJ0ZXIsXG4gICAgfSlcbiAgICBnZXQgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQgKHZhbHVlOiBib29sZWFuKSB7XG5cbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLnRhYmluZGV4ID0gdmFsdWUgPyBudWxsIDogKHRoaXMuc2VsZWN0ZWQgPyAwIDogLTEpO1xuICAgIH1cblxuICAgIGdldCBwYW5lbCAoKTogVGFiUGFuZWwgfCBudWxsIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3BhbmVsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jb250cm9scykgYXMgVGFiUGFuZWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fcGFuZWw7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2sgKCkge1xuXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgdGhpcy5yb2xlID0gJ3RhYidcbiAgICAgICAgdGhpcy50YWJpbmRleCA9IHRoaXMuZGlzYWJsZWQgPyBudWxsIDogLTE7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2FsbGJhY2sgKGNoYW5nZXM6IENoYW5nZXMsIGZpcnN0VXBkYXRlOiBib29sZWFuKSB7XG5cbiAgICAgICAgaWYgKGZpcnN0VXBkYXRlKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnBhbmVsKSB0aGlzLnBhbmVsLmxhYmVsbGVkQnkgPSB0aGlzLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0ICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5zZWxlY3RlZCA9IHRydWUpO1xuICAgIH1cblxuICAgIGRlc2VsZWN0ICgpIHtcblxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMud2F0Y2goKCkgPT4gdGhpcy5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICB9XG5cbiAgICBAbGlzdGVuZXIoeyBldmVudDogJ2NsaWNrJyB9KVxuICAgIHByb3RlY3RlZCBoYW5kbGVDbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VsZWN0KCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2hhbmdlcywgQ29tcG9uZW50LCBjb21wb25lbnQsIGh0bWwsIGxpc3RlbmVyLCBwcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBUYWIgfSBmcm9tICcuL3RhYic7XG5pbXBvcnQgeyBjc3MgfSBmcm9tICcuLi8uLi8uLi9zcmMvY3NzJztcbmltcG9ydCB7IEFycm93TGVmdCwgQXJyb3dSaWdodCwgQXJyb3dEb3duIH0gZnJvbSAnLi4va2V5cyc7XG5cbkBjb21wb25lbnQ8VGFiTGlzdD4oe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLWxpc3QnLFxuICAgIHN0eWxlczogW2Nzc2BcbiAgICA6aG9zdCB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZmxvdzogcm93IG5vd3JhcDtcbiAgICB9XG4gICAgOjpzbG90dGVkKHVpLXRhYikge1xuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuMjVyZW07XG4gICAgfVxuICAgIGBdLFxuICAgIHRlbXBsYXRlOiAoKSA9PiBodG1sYDxzbG90Pjwvc2xvdD5gXG59KVxuZXhwb3J0IGNsYXNzIFRhYkxpc3QgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgcHJpdmF0ZSBfdGFiczogVGFiW10gfCB1bmRlZmluZWQ7XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IHRhYnMgKCk6IFRhYltdIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3RhYnMpIHtcblxuICAgICAgICAgICAgdGhpcy5fdGFicyA9IEFycmF5LmZyb20odGhpcy5xdWVyeVNlbGVjdG9yQWxsKFRhYi5zZWxlY3RvcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhYnM7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdGVkVGFiOiBUYWIgfCB1bmRlZmluZWQ7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAndGFibGlzdCdcbiAgICB9XG5cbiAgICB1cGRhdGVDYWxsYmFjayAoY2hhbmdlczogQ2hhbmdlcywgZmlyc3RVcGRhdGU6IGJvb2xlYW4pIHtcblxuICAgICAgICBpZiAoZmlyc3RVcGRhdGUpIHtcblxuICAgICAgICAgICAgLy8gY29uc3Qgc2xvdCA9IHRoaXMucmVuZGVyUm9vdC5xdWVyeVNlbGVjdG9yKCdzbG90JykgYXMgSFRNTFNsb3RFbGVtZW50O1xuXG4gICAgICAgICAgICAvLyBzbG90LmFkZEV2ZW50TGlzdGVuZXIoJ3Nsb3RjaGFuZ2UnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhgJHtzbG90Lm5hbWV9IGNoYW5nZWQuLi5gLCBzbG90LmFzc2lnbmVkTm9kZXMoKSk7XG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHNlbGVjdG9yIG1hdGNoZXMsIHRoZSB0YWIgd2lsbCBhbHJlYWR5IGJlIHNlbGVjdGVkLCBpZiBub3QsIHRoZSBmaXJzdCB0YWJcbiAgICAgICAgICAgIC8vIHdpbGwgYmUgc2VsZWN0ZWRcbiAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRUYWIodGhpcy5xdWVyeVNlbGVjdG9yKGAkeyBUYWIuc2VsZWN0b3IgfVthcmlhLXNlbGVjdGVkPXRydWVdYCkgYXMgVGFiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFNlbGVjdGVkVGFiICh0YWI/OiBUYWIpIHtcblxuICAgICAgICAvLyBpZiBubyB0YWIgaXMgcHJvdmlkZWQsIHNlbGVjdCB0aGUgZmlyc3QsIG5vbi1kaXNhYmxlZCB0YWJcbiAgICAgICAgaWYgKCF0YWIpIHRhYiA9IHRoaXMuZ2V0TmV4dFRhYigpO1xuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVGFiICYmIHRoaXMuc2VsZWN0ZWRUYWIgIT09IHRhYikge1xuXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0VGFiKHRoaXMuc2VsZWN0ZWRUYWIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3RUYWIodGFiKTtcblxuICAgICAgICB0aGlzLnNlbGVjdGVkVGFiID0gdGFiO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAna2V5ZG93bicgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblxuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuXG4gICAgICAgICAgICBjYXNlIEFycm93TGVmdDpcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRUYWIodGhpcy5nZXRQcmV2aW91c1RhYigpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFRhYikgdGhpcy5zZWxlY3RlZFRhYi5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEFycm93UmlnaHQ6XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGVkVGFiKHRoaXMuZ2V0TmV4dFRhYigpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFRhYikgdGhpcy5zZWxlY3RlZFRhYi5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEFycm93RG93bjpcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkVGFiICYmIHRoaXMuc2VsZWN0ZWRUYWIucGFuZWwpIHRoaXMuc2VsZWN0ZWRUYWIucGFuZWwuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7IGV2ZW50OiAnc2VsZWN0ZWQtY2hhbmdlZCcgfSlcbiAgICBwcm90ZWN0ZWQgaGFuZGxlU2VsZWN0ZWRDaGFuZ2UgKGV2ZW50OiBDdXN0b21FdmVudCkge1xuXG4gICAgICAgIGNvbnN0IHRhYiA9IGV2ZW50LnRhcmdldCBhcyBUYWI7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gZXZlbnQuZGV0YWlsLmN1cnJlbnQgYXMgYm9vbGVhbjtcblxuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcblxuICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZFRhYih0YWIpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3RlZFRhYiA9PT0gdGFiKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUYWIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0UHJldmlvdXNUYWIgKCk6IFRhYiB8IHVuZGVmaW5lZCB7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IHRoaXMuc2VsZWN0ZWRUYWIgPyB0aGlzLnRhYnMuaW5kZXhPZih0aGlzLnNlbGVjdGVkVGFiKSA6IDA7XG4gICAgICAgIGxldCBwcmV2aW91c0luZGV4ID0gc2VsZWN0ZWRJbmRleCAtIDE7XG4gICAgICAgIGxldCBwcmV2aW91c1RhYiA9IHRoaXMudGFic1twcmV2aW91c0luZGV4XTtcblxuICAgICAgICB3aGlsZSAocHJldmlvdXNJbmRleCA+IDAgJiYgcHJldmlvdXNUYWIgJiYgcHJldmlvdXNUYWIuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgcHJldmlvdXNUYWIgPSB0aGlzLnRhYnNbLS1wcmV2aW91c0luZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAocHJldmlvdXNUYWIgJiYgIXByZXZpb3VzVGFiLmRpc2FibGVkKSA/IHByZXZpb3VzVGFiIDogdGhpcy5zZWxlY3RlZFRhYjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0TmV4dFRhYiAoKTogVGFiIHwgdW5kZWZpbmVkIHtcblxuICAgICAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gdGhpcy5zZWxlY3RlZFRhYiA/IHRoaXMudGFicy5pbmRleE9mKHRoaXMuc2VsZWN0ZWRUYWIpIDogLTE7XG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMudGFicy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbmV4dEluZGV4ID0gc2VsZWN0ZWRJbmRleCArIDE7XG4gICAgICAgIGxldCBuZXh0VGFiID0gdGhpcy50YWJzW25leHRJbmRleF07XG5cbiAgICAgICAgd2hpbGUgKG5leHRJbmRleCA8IGxhc3RJbmRleCAmJiBuZXh0VGFiICYmIG5leHRUYWIuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgbmV4dFRhYiA9IHRoaXMudGFic1srK25leHRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG5leHRUYWIgJiYgIW5leHRUYWIuZGlzYWJsZWQpID8gbmV4dFRhYiA6IHRoaXMuc2VsZWN0ZWRUYWI7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuc2VsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0YWIucGFuZWwpIHRhYi5wYW5lbC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZXNlbGVjdFRhYiAodGFiPzogVGFiKSB7XG5cbiAgICAgICAgaWYgKHRhYikge1xuXG4gICAgICAgICAgICB0YWIuZGVzZWxlY3QoKTtcblxuICAgICAgICAgICAgaWYgKHRhYi5wYW5lbCkgdGFiLnBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIHByb3BlcnR5LCBodG1sLCBjb21wb25lbnQsIEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyB9IGZyb20gJy4uLy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBBUklBQm9vbGVhbkNvbnZlcnRlciB9IGZyb20gJy4uL2FyaWEtYm9vbGVhbi1jb252ZXJ0ZXInO1xuaW1wb3J0IHsgY3NzIH0gZnJvbSAnLi4vLi4vLi4vc3JjL2Nzcyc7XG5cbkBjb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWktdGFiLXBhbmVsJyxcbiAgICBzdHlsZXM6IFtjc3NgXG4gICAgOmhvc3Qge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICB6LWluZGV4OiAxO1xuICAgICAgICBwYWRkaW5nOiAwIDFyZW07XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xuICAgICAgICBib3JkZXI6IHZhcigtLWJvcmRlcik7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDAgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cykgdmFyKC0tYm9yZGVyLXJhZGl1cyk7XG4gICAgICAgIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xuICAgIH1cbiAgICA6aG9zdChbYXJpYS1oaWRkZW49dHJ1ZV0pIHtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gICAgYF0sXG4gICAgdGVtcGxhdGU6ICgpID0+IGh0bWxgPHNsb3Q+PC9zbG90PmBcbn0pXG5leHBvcnQgY2xhc3MgVGFiUGFuZWwgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgfSlcbiAgICByb2xlITogc3RyaW5nO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1oaWRkZW4nLFxuICAgICAgICBjb252ZXJ0ZXI6IEFSSUFCb29sZWFuQ29udmVydGVyLFxuICAgIH0pXG4gICAgaGlkZGVuITogYm9vbGVhbjtcblxuICAgIEBwcm9wZXJ0eSh7XG4gICAgICAgIGF0dHJpYnV0ZTogJ2FyaWEtbGFiZWxsZWRieScsXG4gICAgICAgIGNvbnZlcnRlcjogQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLFxuICAgIH0pXG4gICAgbGFiZWxsZWRCeSE6IHN0cmluZztcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrICgpIHtcblxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuXG4gICAgICAgIHRoaXMucm9sZSA9ICd0YWJwYW5lbCdcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQXR0cmlidXRlQ29udmVydGVyU3RyaW5nLCBDb21wb25lbnQsIGNvbXBvbmVudCwgaHRtbCwgbGlzdGVuZXIsIHByb3BlcnR5IH0gZnJvbSAnLi4vLi4vc3JjJztcbmltcG9ydCB7IEFSSUFCb29sZWFuQ29udmVydGVyIH0gZnJvbSAnLi9hcmlhLWJvb2xlYW4tY29udmVydGVyJztcbmltcG9ydCB7IEVudGVyLCBTcGFjZSB9IGZyb20gJy4va2V5cyc7XG5cbkBjb21wb25lbnQ8VG9nZ2xlPih7XG4gICAgc2VsZWN0b3I6ICd1aS10b2dnbGUnLFxuICAgIHRlbXBsYXRlOiB0b2dnbGUgPT4gaHRtbGBcbiAgICA8c3R5bGU+XG4gICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgIC0tdGltaW5nLWN1YmljOiBjdWJpYy1iZXppZXIoMC41NSwgMC4wNiwgMC42OCwgMC4xOSk7XG4gICAgICAgICAgICAtLXRpbWluZy1zaW5lOiBjdWJpYy1iZXppZXIoMC40NywgMCwgMC43NSwgMC43Mik7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tdGltaW5nOiB2YXIoLS10aW1pbmctc2luZSk7XG4gICAgICAgICAgICAtLXRyYW5zaXRpb24tZHVyYXRpb246IC4xcztcbiAgICAgICAgfVxuICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgodmFyKC0tZm9udC1zaXplKSwgMWZyKSk7XG5cbiAgICAgICAgICAgIG1pbi13aWR0aDogY2FsYyh2YXIoLS1mb250LXNpemUpICogMiArIHZhcigtLWJvcmRlci13aWR0aCkgKiAyKTtcbiAgICAgICAgICAgIGhlaWdodDogY2FsYyh2YXIoLS1mb250LXNpemUpICsgdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkgKiAyKTtcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcblxuICAgICAgICAgICAgYm9yZGVyOiB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1mb250LXNpemUsIDFyZW0pO1xuXG4gICAgICAgICAgICAvKiB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3I7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7ICovXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWR1cmF0aW9uKSB2YXIoLS10cmFuc2l0aW9uLXRpbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD10cnVlXSkge1xuICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1zZWxlY3RlZC1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXNlbGVjdGVkLWNvbG9yLCByZ2JhKDAsMCwwLC4yNSkpO1xuICAgICAgICB9XG4gICAgICAgIDpob3N0KFtsYWJlbC1vbl1bbGFiZWwtb2ZmXSkge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvciwgI2ZmZmZmZik7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLCAwLjI1cmVtKTtcbiAgICAgICAgfVxuICAgICAgICAudG9nZ2xlLXRodW1iIHtcbiAgICAgICAgICAgIGhlaWdodDogdmFyKC0tZm9udC1zaXplKTtcbiAgICAgICAgICAgIHdpZHRoOiB2YXIoLS1mb250LXNpemUpO1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgd2lkdGg6IDUwJTtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czogMDtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLnRvZ2dsZS10aHVtYiB7XG4gICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgIH1cbiAgICAgICAgOmhvc3QoW2FyaWEtY2hlY2tlZD1cInRydWVcIl1bbGFiZWwtb25dW2xhYmVsLW9mZl0pIC50b2dnbGUtdGh1bWIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tc2VsZWN0ZWQtY29sb3IsIHJnYmEoMCwwLDAsLjI1KSk7XG4gICAgICAgICAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtcmlnaHQtcmFkaXVzOiBjYWxjKHZhcigtLWJvcmRlci1yYWRpdXMsIDAuMjVyZW0pIC0gdmFyKC0tYm9yZGVyLXdpZHRoLCAwLjEyNXJlbSkpO1xuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6IGNhbGModmFyKC0tYm9yZGVyLXJhZGl1cywgMC4yNXJlbSkgLSB2YXIoLS1ib3JkZXItd2lkdGgsIDAuMTI1cmVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgLmxhYmVsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgLjI1cmVtO1xuICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIGp1c3RpZnktc2VsZjogc3RyZXRjaDtcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLDAsMCwuMjUpKTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZHVyYXRpb24pIHZhcigtLXRyYW5zaXRpb24tdGltaW5nKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwidHJ1ZVwiXSkgLmxhYmVsLW9uIHtcbiAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZmZmZmZmKTtcbiAgICAgICAgfVxuICAgICAgICA6aG9zdChbYXJpYS1jaGVja2VkPVwiZmFsc2VcIl0pIC5sYWJlbC1vZmYge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3IsICNmZmZmZmYpO1xuICAgICAgICB9XG5cbiAgICA8L3N0eWxlPlxuICAgIDxzcGFuIGNsYXNzPVwidG9nZ2xlLXRodW1iXCI+PC9zcGFuPlxuICAgICR7IHRvZ2dsZS5sYWJlbE9uICYmIHRvZ2dsZS5sYWJlbE9mZlxuICAgICAgICA/IGh0bWxgPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1vZmZcIj4keyB0b2dnbGUubGFiZWxPZmYgfTwvc3Bhbj48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLW9uXCI+JHsgdG9nZ2xlLmxhYmVsT24gfTwvc3Bhbj5gXG4gICAgICAgIDogJydcbiAgICB9XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBUb2dnbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgYXR0cmlidXRlOiAnYXJpYS1jaGVja2VkJyxcbiAgICAgICAgY29udmVydGVyOiBBUklBQm9vbGVhbkNvbnZlcnRlclxuICAgIH0pXG4gICAgY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmdcbiAgICB9KVxuICAgIGxhYmVsID0gJyc7XG5cbiAgICBAcHJvcGVydHkoe1xuICAgICAgICBjb252ZXJ0ZXI6IEF0dHJpYnV0ZUNvbnZlcnRlclN0cmluZyxcbiAgICAgICAgcmVmbGVjdFByb3BlcnR5OiBmYWxzZVxuICAgIH0pXG4gICAgbGFiZWxPbiA9ICcnO1xuXG4gICAgQHByb3BlcnR5KHtcbiAgICAgICAgY29udmVydGVyOiBBdHRyaWJ1dGVDb252ZXJ0ZXJTdHJpbmcsXG4gICAgICAgIHJlZmxlY3RQcm9wZXJ0eTogZmFsc2VcbiAgICB9KVxuICAgIGxhYmVsT2ZmID0gJyc7XG5cbiAgICBAcHJvcGVydHkoKVxuICAgIHJvbGUhOiBzdHJpbmc7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG5cbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcblxuICAgICAgICB0aGlzLnJvbGUgPSAnc3dpdGNoJztcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgQGxpc3RlbmVyKHtcbiAgICAgICAgZXZlbnQ6ICdjbGljaydcbiAgICB9KVxuICAgIHRvZ2dsZSAoKSB7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBwcm9wZXJ0eS1jaGFuZ2UgZXZlbnQgZm9yIGBjaGVja2VkYFxuICAgICAgICB0aGlzLndhdGNoKCgpID0+IHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWQpO1xuICAgIH1cblxuICAgIEBsaXN0ZW5lcih7XG4gICAgICAgIGV2ZW50OiAna2V5ZG93bidcbiAgICB9KVxuICAgIHByb3RlY3RlZCBoYW5kZUtleURvd24gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gRW50ZXIgfHwgZXZlbnQua2V5ID09PSBTcGFjZSkge1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHNwYWNlIGtleSBmcm9tIHNjcm9sbGluZyB0aGUgcGFnZVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IGNzcyB9IGZyb20gJy4uLy4uL3NyYy9jc3MnO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gY3NzYFxuZGVtby1hcHAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuXG5oZWFkZXIge1xuICBmbGV4OiAwIDAgYXV0bztcbn1cblxubWFpbiB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBwYWRkaW5nOiAxcmVtO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBvdmVyZmxvdzogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgxNXJlbSwgMWZyKSk7XG4gIGdyaWQtZ2FwOiAxcmVtO1xufVxuXG4uaWNvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWZsb3c6IHJvdyB3cmFwO1xufVxuXG4uc2V0dGluZ3MtbGlzdCB7XG4gIHBhZGRpbmc6IDA7XG4gIGxpc3Qtc3R5bGU6IG5vbmU7XG59XG5cbi5zZXR0aW5ncy1saXN0IGxpIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xufVxuXG51aS1jYXJkIHtcbiAgYm94LXNoYWRvdzogdmFyKC0tYm94LXNoYWRvdyk7XG59XG5cbnVpLWFjY29yZGlvbiB7XG4gIGJveC1zaGFkb3c6IHZhcigtLWJveC1zaGFkb3cpO1xufVxuXG51aS1hY2NvcmRpb24tcGFuZWw6bm90KDpmaXJzdC1jaGlsZCkge1xuICBib3JkZXItdG9wOiB2YXIoLS1ib3JkZXItd2lkdGgpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbnVpLWFjY29yZGlvbi1wYW5lbCBoMyB7XG4gIG1hcmdpbjogMXJlbTtcbn1cblxudWktYWNjb3JkaW9uLXBhbmVsIHAge1xuICBtYXJnaW46IDFyZW07XG59XG5gO1xuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBjb21wb25lbnQgfSBmcm9tICcuLi8uLi9zcmMnO1xuaW1wb3J0ICcuL2FjY29yZGlvbi9hY2NvcmRpb24nO1xuaW1wb3J0IHsgdGVtcGxhdGUgfSBmcm9tICcuL2FwcC50ZW1wbGF0ZSc7XG5pbXBvcnQgJy4vY2FyZCc7XG5pbXBvcnQgJy4vY2hlY2tib3gnO1xuaW1wb3J0ICcuL2ljb24vaWNvbic7XG5pbXBvcnQgJy4vdGFicy90YWInO1xuaW1wb3J0ICcuL3RhYnMvdGFiLWxpc3QnO1xuaW1wb3J0ICcuL3RhYnMvdGFiLXBhbmVsJztcbmltcG9ydCAnLi90b2dnbGUnO1xuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSAnLi9hcHAuc3R5bGVzJztcblxuQGNvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkZW1vLWFwcCcsXG4gICAgc2hhZG93OiBmYWxzZSxcbiAgICBzdHlsZXM6IFtzdHlsZXNdLFxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxufSlcbmV4cG9ydCBjbGFzcyBBcHAgZXh0ZW5kcyBDb21wb25lbnQgeyB9XG4iLCJpbXBvcnQgJy4vc3JjL2FwcCc7XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCAoKSB7XG5cbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VpLWNoZWNrYm94Jyk7XG5cbiAgICBpZiAoY2hlY2tib3gpIHtcblxuICAgICAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGVja2VkLWNoYW5nZWQnLCBldmVudCA9PiBjb25zb2xlLmxvZygoZXZlbnQgYXMgQ3VzdG9tRXZlbnQpLmRldGFpbCkpO1xuICAgIH1cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBib290c3RyYXApO1xuIl0sIm5hbWVzIjpbInByZXBhcmVDb25zdHJ1Y3RvciIsInRzbGliXzEuX19kZWNvcmF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDakMsSUEwQk8sTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUs7SUFDbEMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUNGOztJQzNDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQWMsS0FBSyxTQUFTO0lBQy9ELElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUI7SUFDbkQsUUFBUSxTQUFTLENBQUM7QUFDbEIsSUFjQTtJQUNBO0lBQ0E7SUFDQTtBQUNBLElBQU8sTUFBTSxXQUFXLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxJQUFJLEtBQUs7SUFDckUsSUFBSSxJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7SUFDekIsSUFBSSxPQUFPLElB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
