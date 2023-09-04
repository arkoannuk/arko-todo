// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

export function hideModalAndResetForm(modalId, formId) {
    const myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
    myModal.hide();

    setTimeout(function () {
        document.getElementById(formId).reset();
    }, 100);
}