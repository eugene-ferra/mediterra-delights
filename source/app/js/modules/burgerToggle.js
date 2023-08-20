import toggleElementState from './toggleElementState';

function burgerToggle(trigger, element) {
  trigger.addEventListener('click', () => {
    toggleElementState(trigger);
    toggleElementState(element);
    toggleElementState(document.body);
  });
}

export default burgerToggle;
