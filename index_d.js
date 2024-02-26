document.addEventListener('DOMContentLoaded', () => {

  initForm();


})


function initForm() {
  const mainForm = document.getElementById('orderForm');
  const submitButton = document.getElementById('orderFormButton');

  mainForm.addEventListener('input', checkValidity)
  submitButton.addEventListener('click', handleFormSubmit);
}

function handleFormSubmit(event) {
  event.preventDefault()
  const formNode = event.target.form

  const data = serializeForm(formNode);

  console.log(Array.from(data.entries()))
}

function checkValidity(event) {
  const formNode = event.target.form

  const { elements } = formNode

  Array.from(elements)
    .filter((item) => !!item.name)
    .forEach((element) => {
      const { name, type } = element
      const value = type === 'checkbox' ? element.checked : element.value


      console.log(name, value)
    })
}

function serializeForm(formNode) {
  return new FormData(formNode)
}
