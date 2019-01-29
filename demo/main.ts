import './src/checkbox';

function bootstrap () {

    const checkbox = document.querySelector('check-box');

    if (checkbox) {

        checkbox.addEventListener('checked-changed', event => console.log((event as CustomEvent).detail));
    }
}

window.addEventListener('load', bootstrap);
