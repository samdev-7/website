import { writable } from 'svelte/store';

export var scroll = writable(0)

export function scrollToAnchor(event, elementId) {
    let element = document.getElementById(elementId);
    if (element) {
        event.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        if (elementId != 'top') {
            window.history.pushState('', '', '#' + elementId);
        } else {
            window.history.pushState('', '', '/');
        }
    }
}

export function scrollToHome(event) {
    if (window.location.pathname == '/') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState('', '', '/');
    }
}
