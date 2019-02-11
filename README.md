# custom-element
A custom-element implementation using lit-html.

## Why?
* Browsers are capable, no need for large abstractions
* Web Components are a standard, can be used in any framework or without
* API's are somewhat low-level, CustomElement reduces boilerplate, implements best practices
* Use with injector and module for framework-like experience

## Features
* Performant and lightweight
* Customizable
* Property decorator, automated reflection of attributes, semi-automated property change events
* Listener decorator, automated binding and unbinding of listeners, configurable listener targets
* Lifecycle hooks
* Full inheritance support for properties, listeners and attributes
* Powerful template system (lit-html) with html and svg support
* Written in TypeScript, Generics for property declarations

## Guide

### Introduction
* Installation
* Creating a CustomElement
* Using a CustomElement
  * In Typescipt projects
  * In an HTML page

### CustomElement
* Overview
* customElement decorator
* CustomElement declaration

### Templates
* Defining a template
* lit-html documentation link

### Attributes and Properties
* Overview
* Property decorator
* Property declaration
* Property reflectors, notifiers and change detectors
* Attribute converters

### Events
* Overview
* Listener decorator
* Listener declaration
* Property change events
* The watch method
* Lifecycle events

### Lifecycle
* CustomElement lifecycle explained
* Lifecycle callbacks
* Lifecycle events
