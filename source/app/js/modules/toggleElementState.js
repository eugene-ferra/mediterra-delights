function toggleElementState(element) {
  const currentState = element.getAttribute('data-state');

  if (currentState === 'active') {
    element.setAttribute('data-state', 'inactive');
  } else {
    element.setAttribute('data-state', 'active');
  }
}

export default toggleElementState;
