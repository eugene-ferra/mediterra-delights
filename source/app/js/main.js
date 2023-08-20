import burgerToggle from './modules/burgerToggle';

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('#burger');
  const mobHeader = document.querySelector('#header-content');

  burgerToggle(burger, mobHeader);
});
