import './src/app';

function bootstrap () {

    const checkbox = document.querySelector('ui-checkbox');

    if (checkbox) {

        checkbox.addEventListener('checked-changed', event => console.log((event as CustomEvent).detail));
    }
}

window.addEventListener('load', bootstrap);
