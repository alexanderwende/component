# custom-element
A fast and lightweight Web Component implementation using lit-html.

## Why?
* Most modern browsers (looking at you, Edge) support the APIs required for Web Components and heavy frameworks are no longer needed to build reusable Web Components. Support for Edge can be polyfilled, check out https://github.com/webcomponents/webcomponentsjs.
* Web Components are a standard and will work with any framework or just on their own.
* Web Component API's are somewhat low-level; custom-element reduces boilerplate, implements best practices and provides access to declarative templates using lit-html.
* custom-element is influenced by [LitElement](https://lit-element.polymer-project.org/), but makes a few different decissions to reduce the cost of instantiation and improve ergonomics. 

[//]: # (Use with injector and module for framework-like experience)

## Features
* Performant and lightweight
* Customizable (opt out of shadowDOM if you need to, customize property reflection, ...)
* Property decorator: Automated reflection of attributes, semi-automated property change events
* Listener decorator: Automated binding and unbinding of listeners, configurable listener targets (bind to window or document events)
* Lifecycle hooks (via callbacks and CustomEvents)
* Full inheritance support for properties, listeners and attributes
* Powerful template system (lit-html) with html and svg support
* Written in TypeScript: Fully typed with Generics for property declarations

## Quickstart
### Installation

## Documentation
The documentation is currently work in progress. However, the source code is fully documented and has examples where applicable.
